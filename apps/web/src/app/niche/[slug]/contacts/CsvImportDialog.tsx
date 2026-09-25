'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import { bulkImportContacts } from './actions';

type CustomFieldDef = { id: string; key: string; label: string };

const APP_FIELDS = [
  { value: '', label: '— Skip this column —' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
];

export default function CsvImportDialog({
  open,
  onClose,
  slug,
  customFieldDefs,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  customFieldDefs: CustomFieldDef[];
}) {
  const [step, setStep] = useState<'upload' | 'map' | 'result'>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fieldOptions = [
    ...APP_FIELDS,
    ...customFieldDefs.map((def) => ({ value: `custom:${def.key}`, label: def.label })),
  ];

  const handleFile = (file: File) => {
    setError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          setError('Could not detect any columns in this file.');
          return;
        }
        setHeaders(results.meta.fields);
        setRows(results.data);

        // Best-effort auto-guess based on common header names
        const guessed: Record<string, string> = {};
        for (const h of results.meta.fields) {
          const lower = h.toLowerCase();
          if (lower.includes('first')) guessed[h] = 'firstName';
          else if (lower.includes('last')) guessed[h] = 'lastName';
          else if (lower.includes('email')) guessed[h] = 'email';
          else if (lower.includes('phone')) guessed[h] = 'phone';
        }
        setMapping(guessed);
        setStep('map');
      },
      error: (err) => setError(err.message),
    });
  };

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    try {
      const mappedRows = rows.map((row) => {
        const mapped: any = { customFields: {} };
        for (const header of headers) {
          const target = mapping[header];
          if (!target) continue;
          if (target.startsWith('custom:')) {
            mapped.customFields[target.slice(7)] = row[header];
          } else {
            mapped[target] = row[header];
          }
        }
        return mapped;
      });

      const res = await bulkImportContacts(slug, mappedRows);
      setResult(res);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Import Contacts from CSV</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'upload' && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a CSV file exported from your previous CRM or spreadsheet. The first row
              should contain column headers.
            </Typography>
            <Button variant="contained" component="label">
              Choose File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
            </Button>
          </Box>
        )}

        {step === 'map' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {rows.length} rows detected. Map each column to a field, or skip columns you don't
              need.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>CSV Column</TableCell>
                  <TableCell>Sample Value</TableCell>
                  <TableCell>Maps To</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {headers.map((header) => (
                  <TableRow key={header}>
                    <TableCell>{header}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {rows[0]?.[header] ?? ''}
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={mapping[header] ?? ''}
                        onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                      >
                        {fieldOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isImporting && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        )}

        {step === 'result' && result && (
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Imported {result.created} contact{result.created === 1 ? '' : 's'}.
              {result.skipped > 0 && ` Skipped ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'} (matched by email).`}
            </Alert>
            {result.errors.length > 0 && (
              <Alert severity="warning">
                {result.errors.length} row(s) failed:
                <ul>
                  {result.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {step === 'map' && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleImport} disabled={isImporting}>
              Import {rows.length} Contacts
            </Button>
          </>
        )}
        {step === 'result' && <Button onClick={handleClose}>Done</Button>}
        {step === 'upload' && <Button onClick={handleClose}>Cancel</Button>}
      </DialogActions>
    </Dialog>
  );
}
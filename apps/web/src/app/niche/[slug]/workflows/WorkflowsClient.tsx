'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { createWorkflow, toggleWorkflowActive, deleteWorkflow } from './actions';
import { TRIGGER_LABELS, ACTION_LABELS } from '@/lib/workflow-labels';

type Stage = { id: string; name: string };
type Workflow = {
  id: string;
  name: string;
  isActive: boolean;
  triggerType: string | null;
  triggerConfig: Record<string, any>;
  steps: { type: string; config: Record<string, any> }[];
};

type StepDraft = { type: string; config: Record<string, any> };

const ACTION_TYPES = Object.keys(ACTION_LABELS);
const TRIGGER_TYPES = Object.keys(TRIGGER_LABELS);
const ANY_STAGE = '__any__';

function StepConfigFields({
  step,
  onChange,
}: {
  step: StepDraft;
  onChange: (config: Record<string, any>) => void;
}) {
  if (step.type === 'ADD_TAG') {
    return (
      <TextField
        label="Tag name"
        size="small"
        fullWidth
        value={step.config.tagName ?? ''}
        onChange={(e) => onChange({ tagName: e.target.value })}
      />
    );
  }
  if (step.type === 'WAIT') {
    return (
      <TextField
        label="Wait (hours)"
        type="number"
        size="small"
        fullWidth
        value={step.config.delayHours ?? ''}
        onChange={(e) => onChange({ delayHours: Number(e.target.value) })}
      />
    );
  }
    if (step.type === 'SEND_EMAIL') {
    return (
      <Stack spacing={1}>
        <TextField
          label="Subject"
          size="small"
          fullWidth
          value={step.config.subject ?? ''}
          onChange={(e) => onChange({ ...step.config, subject: e.target.value })}
        />
        <TextField
          label="Message"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={step.config.message ?? ''}
          onChange={(e) => onChange({ ...step.config, message: e.target.value })}
        />
      </Stack>
    );
  }
  if (step.type === 'SEND_SMS') {
    return (
      <TextField
        label="Message"
        size="small"
        fullWidth
        multiline
        minRows={2}
        value={step.config.message ?? ''}
        onChange={(e) => onChange({ message: e.target.value })}
        helperText="SMS sending isn't wired up yet (Twilio comes later) — this just saves the message for now."
      />
    );
  }
  return <TextField label="Config (not yet built for this step type)" size="small" fullWidth disabled />;
}

export default function WorkflowsClient({
  slug,
  initialWorkflows,
  stages,
}: {
  slug: string;
  initialWorkflows: Workflow[];
  stages: Stage[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState(TRIGGER_TYPES[0]);
  const [targetStageId, setTargetStageId] = useState(ANY_STAGE);
  const [steps, setSteps] = useState<StepDraft[]>([{ type: ACTION_TYPES[0], config: {} }]);

  const addStep = () => setSteps([...steps, { type: ACTION_TYPES[0], config: {} }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStepType = (index: number, type: string) =>
    setSteps(steps.map((s, i) => (i === index ? { type, config: {} } : s)));
  const updateStepConfig = (index: number, config: Record<string, any>) =>
    setSteps(steps.map((s, i) => (i === index ? { ...s, config } : s)));

  const resetForm = () => {
    setName('');
    setTriggerType(TRIGGER_TYPES[0]);
    setTargetStageId(ANY_STAGE);
    setSteps([{ type: ACTION_TYPES[0], config: {} }]);
  };

  const handleSubmit = async () => {
    if (!name) return;

    const triggerConfig =
      triggerType === 'STAGE_CHANGED' && targetStageId !== ANY_STAGE
        ? { stageId: targetStageId }
        : {};

    await createWorkflow(slug, { name, triggerType, triggerConfig, steps });
    resetForm();
    setOpen(false);
  };

  const handleDelete = async (workflow: Workflow) => {
    if (!window.confirm(`Delete "${workflow.name}"? This can't be undone.`)) return;
    await deleteWorkflow(slug, workflow.id);
  };

  const triggerSummary = (wf: Workflow) => {
    if (!wf.triggerType) return 'No trigger';
    const base = TRIGGER_LABELS[wf.triggerType] ?? wf.triggerType;
    if (wf.triggerType === 'STAGE_CHANGED' && wf.triggerConfig?.stageId) {
      const stage = stages.find((s) => s.id === wf.triggerConfig.stageId);
      return `Moved to "${stage?.name ?? 'Unknown stage'}"`;
    }
    return base;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Workflows
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Create Workflow
        </Button>
      </Box>

      {initialWorkflows.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <BoltIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            No workflows yet. Create one to automate what happens when something occurs in this
            workspace.
          </Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {initialWorkflows.map((wf) => (
          <Paper key={wf.id} variant="outlined" sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {wf.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={triggerSummary(wf)} color="primary" variant="outlined" />
                  {wf.steps.map((step, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Chip size="small" label={ACTION_LABELS[step.type] ?? step.type} />
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={wf.isActive}
                  onChange={(e) => toggleWorkflowActive(slug, wf.id, e.target.checked)}
                />
                <IconButton size="small" onClick={() => handleDelete(wf)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Workflow</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Workflow Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />

            <TextField
              select
              label="Trigger: When this happens..."
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              fullWidth
            >
              {TRIGGER_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {TRIGGER_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>

            {triggerType === 'STAGE_CHANGED' && (
              <TextField
                select
                label="Target stage"
                value={targetStageId}
                onChange={(e) => setTargetStageId(e.target.value)}
                fullWidth
                helperText="Only fire when an opportunity moves into this stage, or leave as Any stage."
              >
                <MenuItem value={ANY_STAGE}>Any stage</MenuItem>
                {stages.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Divider>Then do this...</Divider>

            {steps.map((step, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ mt: 1.5, color: 'text.disabled', width: 20 }}>
                  {index + 1}.
                </Typography>
                <Stack spacing={1} sx={{ flexGrow: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="Action"
                    value={step.type}
                    onChange={(e) => updateStepType(index, e.target.value)}
                    fullWidth
                  >
                    {ACTION_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {ACTION_LABELS[t]}
                      </MenuItem>
                    ))}
                  </TextField>
                  <StepConfigFields step={step} onChange={(config) => updateStepConfig(index, config)} />
                </Stack>
                <IconButton size="small" onClick={() => removeStep(index)} disabled={steps.length === 1} sx={{ mt: 0.5 }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            <Button size="small" startIcon={<AddIcon />} onClick={addStep} sx={{ alignSelf: 'flex-start' }}>
              Add Step
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!name}>
            Save Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
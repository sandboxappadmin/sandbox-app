'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

type Stage = { name: string; count: number; value: number };
type GrowthPoint = { date: string; count: number };

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function DashboardClient({
  workspaceLabel,
  stages,
  totalPipelineValue,
  totalOpenOpportunities,
  contactCount,
  activeWorkflowCount,
  upcomingAppointmentCount,
  contactGrowth,
}: {
  workspaceLabel: string;
  stages: Stage[];
  totalPipelineValue: number;
  totalOpenOpportunities: number;
  contactCount: number;
  activeWorkflowCount: number;
  upcomingAppointmentCount: number;
  contactGrowth: GrowthPoint[];
}) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        {workspaceLabel}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, mb: 4 }}>
        Overview
      </Typography>

            {stages.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography color="text.secondary">No pipeline data yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Opportunities by Stage
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stages}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                New Contacts (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={contactGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    interval={4}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                  <Line type="monotone" dataKey="count" stroke="#2e7d32" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {upcomingAppointmentCount > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
          <Typography variant="body2">
            You have <strong>{upcomingAppointmentCount}</strong> upcoming appointment
            {upcomingAppointmentCount === 1 ? '' : 's'}.
          </Typography>
        </Paper>
      )}

      {stages.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography color="text.secondary">No pipeline data yet.</Typography>
        </Paper>
      ) : null}
    </Box>
  );
}
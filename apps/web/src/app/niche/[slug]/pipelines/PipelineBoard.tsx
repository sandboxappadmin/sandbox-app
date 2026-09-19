'use client';

import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { createOpportunity, updateOpportunity, moveOpportunity, deleteOpportunity } from './actions';

type Opportunity = {
  id: string;
  name: string;
  value: number | null;
  contactId: string;
  contactName: string;
};
type Stage = { id: string; name: string; order: number; opportunities: Opportunity[] };
type Contact = { id: string; name: string };

function OpportunityCard({
  opp,
  onEdit,
  onDelete,
}: {
  opp: Opportunity;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: opp.id });

  return (
    <Paper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-dnd-card="true"
      sx={{
        p: 1.5,
        mb: 1,
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        position: 'relative',
        zIndex: isDragging ? 10 : 'auto',
        '&:hover .opp-actions': { opacity: 1 },
      }}
    >
      <Box
        className="opp-actions"
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          opacity: 0,
          transition: 'opacity 0.15s ease',
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        <IconButton size="small" onClick={onEdit}>
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton size="small" onClick={onDelete}>
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 600, pr: 5 }}>
        {opp.name}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {opp.contactName}
      </Typography>
      {opp.value !== null && (
        <Typography variant="caption" sx={{ color: 'success.main' }}>
          ${opp.value.toLocaleString()}
        </Typography>
      )}
    </Paper>
  );
}

function StageColumn({
  stage,
  collapsed,
  onToggle,
  onEditCard,
  onDeleteCard,
}: {
  stage: Stage;
  collapsed: boolean;
  onToggle: () => void;
  onEditCard: (opp: Opportunity) => void;
  onDeleteCard: (opp: Opportunity) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  if (collapsed) {
    return (
      <Box
        ref={setNodeRef}
        onClick={onToggle}
        sx={{
          width: 44,
          flexShrink: 0,
          bgcolor: isOver ? 'action.hover' : 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          cursor: 'pointer',
        }}
      >
        <IconButton size="small" sx={{ mb: 1 }}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="caption"
          sx={{ writingMode: 'vertical-rl', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {stage.name} ({stage.opportunities.length})
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 260,
        maxWidth: 260,
        flexShrink: 0,
        bgcolor: isOver ? 'action.hover' : 'background.paper',
        borderRadius: 1,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {stage.name} ({stage.opportunities.length})
        </Typography>
        <IconButton size="small" onClick={onToggle}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>
      {stage.opportunities.map((opp) => (
        <OpportunityCard
          key={opp.id}
          opp={opp}
          onEdit={() => onEditCard(opp)}
          onDelete={() => onDeleteCard(opp)}
        />
      ))}
    </Box>
  );
}

const EMPTY_FORM: { name: string; value: string; contact: Contact | null } = {
  name: '',
  value: '',
  contact: null,
};

export default function PipelineBoard({
  slug,
  pipelineName,
  stages: initialStages,
  contacts,
}: {
  slug: string;
  pipelineName: string;
  stages: Stage[];
  contacts: Contact[];
}) {
  const [stages, setStages] = useState(initialStages);
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(
    () => new Set(initialStages.filter((s) => s.opportunities.length === 0).map((s) => s.id))
  );

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const scrollRef = useRef<HTMLDivElement>(null);
  const panState = useRef({ isPanning: false, startX: 0, startScrollLeft: 0 });

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-dnd-card]') || target.closest('button')) return;
    if (!scrollRef.current) return;

    panState.current = {
      isPanning: true,
      startX: e.clientX,
      startScrollLeft: scrollRef.current.scrollLeft,
    };
    scrollRef.current.style.cursor = 'grabbing';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!panState.current.isPanning || !scrollRef.current) return;
      const delta = moveEvent.clientX - panState.current.startX;
      scrollRef.current.scrollLeft = panState.current.startScrollLeft - delta;
    };

    const handleMouseUp = () => {
      panState.current.isPanning = false;
      if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const expandStage = (stageId: string) => {
    setCollapsedStages((prev) => {
      if (!prev.has(stageId)) return prev;
      const next = new Set(prev);
      next.delete(stageId);
      return next;
    });
  };

  const toggleStage = (stageId: string) => {
    setCollapsedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const opportunityId = active.id as string;
    const newStageId = over.id as string;

    const currentStage = stages.find((s) => s.opportunities.some((o) => o.id === opportunityId));
    if (!currentStage || currentStage.id === newStageId) return;

    const opp = currentStage.opportunities.find((o) => o.id === opportunityId)!;

    setStages((prev) =>
      prev.map((s) => {
        if (s.id === currentStage.id) {
          return { ...s, opportunities: s.opportunities.filter((o) => o.id !== opportunityId) };
        }
        if (s.id === newStageId) {
          return { ...s, opportunities: [opp, ...s.opportunities] };
        }
        return s;
      })
    );

    expandStage(newStageId);
    moveOpportunity(slug, opportunityId, newStageId);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEditDialog = (opp: Opportunity) => {
    setEditingId(opp.id);
    setForm({
      name: opp.name,
      value: opp.value !== null ? String(opp.value) : '',
      contact: contacts.find((c) => c.id === opp.contactId) ?? null,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.contact || !form.name) return;

    if (editingId) {
      await updateOpportunity(slug, editingId, {
        name: form.name,
        value: form.value,
        contactId: form.contact.id,
      });
    } else {
      const targetStageId = stages[0]?.id ?? '';
      await createOpportunity(slug, {
        name: form.name,
        value: form.value,
        contactId: form.contact.id,
        stageId: targetStageId,
      });
      expandStage(targetStageId);
    }

    setForm(EMPTY_FORM);
    setOpen(false);
  };

  const handleDelete = async (opp: Opportunity) => {
    if (!window.confirm(`Delete "${opp.name}"? This can't be undone.`)) return;
    await deleteOpportunity(slug, opp.id);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {pipelineName}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Opportunity
        </Button>
      </Box>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Box
          ref={scrollRef}
          onMouseDown={handleCanvasMouseDown}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            flexGrow: 1,
            cursor: 'grab',
            userSelect: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              collapsed={collapsedStages.has(stage.id)}
              onToggle={() => toggleStage(stage.id)}
              onEditCard={openEditDialog}
              onDeleteCard={handleDelete}
            />
          ))}
        </Box>
      </DndContext>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Opportunity' : 'Add Opportunity'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Opportunity Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <Autocomplete
              options={contacts}
              getOptionLabel={(c) => c.name}
              value={form.contact}
              onChange={(_e, value) => setForm({ ...form, contact: value })}
              renderInput={(params) => <TextField {...params} label="Contact" />}
            />
            <TextField
              label="Value ($)"
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.contact || !form.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
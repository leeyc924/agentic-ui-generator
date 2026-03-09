import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useEditorStore } from "../../../stores/editor-store";
import type {
  A2UIComponent,
  Workflow,
  WorkflowAction,
  WorkflowActionType,
  WorkflowTrigger,
} from "../../../lib/types";
import { TRIGGER_OPTIONS } from "../../../lib/types";

interface WorkflowPanelProps {
  readonly widget: A2UIComponent;
}

const ACTION_TYPE_LABELS: Record<WorkflowActionType, string> = {
  api: "API 호출",
  navigate: "페이지 이동",
  setState: "상태 변경",
  submitForm: "폼 제출",
  custom: "커스텀",
};

const TRIGGER_LABELS: Record<WorkflowTrigger, string> = {
  onClick: "클릭",
  onChange: "값 변경",
  onSubmit: "제출",
  onBlur: "포커스 해제",
  onFocus: "포커스",
};

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function generateId(): string {
  return `action-${Date.now().toString(36)}`;
}

function createEmptyAction(type: WorkflowActionType): WorkflowAction {
  const base = { id: generateId(), type, label: "" };
  switch (type) {
    case "api":
      return { ...base, method: "GET", url: "", body: "" };
    case "navigate":
      return { ...base, path: "" };
    case "setState":
      return { ...base, target: "", value: "" };
    case "submitForm":
      return { ...base, formId: "" };
    case "custom":
      return { ...base, description: "" };
  }
}

function ActionEditor({
  action,
  onChange,
  onRemove,
}: {
  readonly action: WorkflowAction;
  readonly onChange: (updated: WorkflowAction) => void;
  readonly onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const update = (patch: Partial<WorkflowAction>) => {
    onChange({ ...action, ...patch } as WorkflowAction);
  };

  return (
    <div className="border border-border rounded bg-bg">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-text-muted hover:text-text-primary"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="text-xs font-medium text-accent flex-1">
          {ACTION_TYPE_LABELS[action.type]}
        </span>
        <span className="text-xs text-text-muted truncate max-w-[120px]">
          {action.label || action.url || action.path || action.description || ""}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-text-muted hover:text-error p-0.5"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-2 px-2 pb-2 border-t border-border pt-2">
          <Field label="라벨" value={action.label ?? ""} onChange={(v) => update({ label: v })} />

          {action.type === "api" && (
            <>
              <div className="flex gap-1">
                <select
                  value={action.method ?? "GET"}
                  onChange={(e) => update({ method: e.target.value as WorkflowAction["method"] })}
                  className="text-xs bg-surface-elevated border border-border rounded px-1.5 py-1 text-text-primary w-20"
                >
                  {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={action.url ?? ""}
                  onChange={(e) => update({ url: e.target.value })}
                  placeholder="/api/endpoint"
                  className="flex-1 text-xs bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary"
                />
              </div>
              <Field
                label="Body (JSON)"
                value={action.body ?? ""}
                onChange={(v) => update({ body: v })}
                multiline
              />
            </>
          )}

          {action.type === "navigate" && (
            <Field label="경로" value={action.path ?? ""} onChange={(v) => update({ path: v })} placeholder="/dashboard" />
          )}

          {action.type === "setState" && (
            <>
              <Field label="대상" value={action.target ?? ""} onChange={(v) => update({ target: v })} placeholder="widgetId.visible" />
              <Field label="값" value={action.value ?? ""} onChange={(v) => update({ value: v })} placeholder="true" />
            </>
          )}

          {action.type === "submitForm" && (
            <Field label="Form ID" value={action.formId ?? ""} onChange={(v) => update({ formId: v })} placeholder="login-form" />
          )}

          {action.type === "custom" && (
            <Field
              label="설명"
              value={action.description ?? ""}
              onChange={(v) => update({ description: v })}
              placeholder="이 액션이 하는 일을 설명하세요"
              multiline
            />
          )}

          <div className="flex gap-2">
            <Field
              label="성공 시 (action id)"
              value={action.onSuccess ?? ""}
              onChange={(v) => update({ onSuccess: v || undefined })}
              placeholder=""
            />
            <Field
              label="실패 시 (action id)"
              value={action.onError ?? ""}
              onChange={(v) => update({ onError: v || undefined })}
              placeholder=""
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder?: string;
  readonly multiline?: boolean;
}) {
  const cls = "w-full text-xs bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary";
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-text-muted uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${cls} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function WorkflowEditor({
  workflow,
  availableTriggers,
  onChange,
  onRemove,
}: {
  readonly workflow: Workflow;
  readonly availableTriggers: readonly WorkflowTrigger[];
  readonly onChange: (updated: Workflow) => void;
  readonly onRemove: () => void;
}) {
  const [addingType, setAddingType] = useState<WorkflowActionType | "">("");

  const handleAddAction = () => {
    if (!addingType) return;
    const newAction = createEmptyAction(addingType);
    onChange({
      ...workflow,
      actions: [...workflow.actions, newAction],
    });
    setAddingType("");
  };

  const handleUpdateAction = (index: number, updated: WorkflowAction) => {
    const actions = workflow.actions.map((a, i) => (i === index ? updated : a));
    onChange({ ...workflow, actions });
  };

  const handleRemoveAction = (index: number) => {
    const actions = workflow.actions.filter((_, i) => i !== index);
    onChange({ ...workflow, actions });
  };

  return (
    <div className="border border-border rounded bg-surface-elevated">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <div className="flex items-center gap-2">
          <select
            value={workflow.trigger}
            onChange={(e) => onChange({ ...workflow, trigger: e.target.value as WorkflowTrigger })}
            className="text-xs bg-bg border border-border rounded px-1.5 py-0.5 text-text-primary"
          >
            {availableTriggers.map((t) => (
              <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>
            ))}
          </select>
          <span className="text-[10px] text-text-muted">
            {workflow.actions.length}개 액션
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-text-muted hover:text-error p-0.5"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 p-2">
        {workflow.actions.map((action, i) => (
          <ActionEditor
            key={action.id}
            action={action}
            onChange={(updated) => handleUpdateAction(i, updated)}
            onRemove={() => handleRemoveAction(i)}
          />
        ))}

        <div className="flex gap-1 mt-1">
          <select
            value={addingType}
            onChange={(e) => setAddingType(e.target.value as WorkflowActionType | "")}
            className="flex-1 text-xs bg-bg border border-border rounded px-1.5 py-1 text-text-primary"
          >
            <option value="">액션 선택...</option>
            {(Object.keys(ACTION_TYPE_LABELS) as WorkflowActionType[]).map((t) => (
              <option key={t} value={t}>{ACTION_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddAction}
            disabled={!addingType}
            className="flex items-center gap-0.5 px-2 py-1 text-xs rounded bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={12} />
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowPanel({ widget }: WorkflowPanelProps) {
  const updateWidget = useEditorStore((s) => s.updateWidget);
  const workflows: Workflow[] = [...(widget.workflows ?? [])];
  const availableTriggers = TRIGGER_OPTIONS[widget.type] ?? [];

  if (availableTriggers.length === 0) return null;

  const handleAddWorkflow = () => {
    const usedTriggers = new Set(workflows.map((w) => w.trigger));
    const nextTrigger = availableTriggers.find((t) => !usedTriggers.has(t)) ?? availableTriggers[0];
    const updated = [...workflows, { trigger: nextTrigger, actions: [] }];
    updateWidget(widget.id, { workflows: updated });
  };

  const handleUpdateWorkflow = (index: number, updated: Workflow) => {
    const next = workflows.map((w, i) => (i === index ? updated : w));
    updateWidget(widget.id, { workflows: next });
  };

  const handleRemoveWorkflow = (index: number) => {
    const next = workflows.filter((_, i) => i !== index);
    updateWidget(widget.id, { workflows: next });
  };

  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      {workflows.map((wf, i) => (
        <WorkflowEditor
          key={`${wf.trigger}-${i}`}
          workflow={wf}
          availableTriggers={availableTriggers}
          onChange={(updated) => handleUpdateWorkflow(i, updated)}
          onRemove={() => handleRemoveWorkflow(i)}
        />
      ))}

      <button
        type="button"
        onClick={handleAddWorkflow}
        className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-dashed border-border rounded hover:border-accent hover:text-accent text-text-muted transition-colors"
      >
        <Plus size={14} />
        워크플로우 추가
      </button>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';

export type ContextualTool = {
  id: string;
  label: string;
  note: string;
  visible: boolean;
  onOpen: () => void;
};

export function ContextualToolList({ tools }: { tools: ContextualTool[] }) {
  const visibleTools = tools.filter(tool => tool.visible);
  if (!visibleTools.length) return null;

  return (
    <section className="contextual-tool-list" aria-label="Trip tools">
      {visibleTools.map(tool => (
        <button className="mini-tool" key={tool.id} onClick={tool.onOpen}>
          <span><b>{tool.label}</b><small>{tool.note}</small></span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      ))}
    </section>
  );
}

import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { graphService } from '../services/graphService.js';
import { entityService } from '../services/entityService.js';
import { relationshipService } from '../services/relationshipService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import FindingsPanel from '../components/findings/FindingsPanel.jsx';
import EntityDossier from '../components/dossier/EntityDossier.jsx';
import EntityNode from '../components/graph/EntityNode.jsx';

const nodeTypes = { entity: EntityNode };

function layout(backendNodes) {
  const grouped = {};
  backendNodes.forEach((n) => {
    const t = n.type || 'OTHER';
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(n);
  });
  const types = Object.keys(grouped);
  const nodes = [];
  types.forEach((type, col) => {
    grouped[type].forEach((n, row) => {
      nodes.push({
        id: n.id,
        type: 'entity',
        position: { x: col * 260, y: row * 110 },
        data: {
          label: n.label || n.id,
          type: n.type,
          risk: n.risk,
          severity: n.severity,
        },
      });
    });
  });
  return nodes;
}

export default function GraphPage() {
  const { caseId } = useParams();
  const { selectedEntity, setSelectedEntity, currentCase, refreshKey } = useInvestigation();
  const [selectedEdge, setSelectedEdge] = useState(null);

  const graph = useAsyncResource(() => graphService.getGraph(caseId), [caseId, refreshKey]);
  const anomalies = useAsyncResource(() => relationshipService.getAnomalies(caseId), [caseId, refreshKey]);

  const rfNodes = useMemo(() => (graph.data?.nodes ? layout(graph.data.nodes) : []), [graph.data]);
  const rfEdges = useMemo(
    () =>
      (graph.data?.edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#64748b' },
        style: { stroke: '#64748b' },
        data: e,
      })),
    [graph.data]
  );

  const onNodeClick = useCallback(
    async (_evt, node) => {
      setSelectedEdge(null);
      try {
        const dossier = await entityService.getEntityDossier(caseId, node.id);
        setSelectedEntity(dossier);
      } catch {
        setSelectedEntity(node.data ? { id: node.id, ...node.data, score: node.data.risk } : null);
      }
    },
    [caseId, setSelectedEntity]
  );

  const onEdgeClick = useCallback((_evt, edge) => {
    setSelectedEdge(edge.data || edge);
  }, []);

  if (graph.loading) return <LoadingSpinner text="Loading network graph..." />;
  if (graph.error) return <ErrorState message={graph.error} onRetry={graph.reload} />;

  const analyzed = String(currentCase?.status || '').toUpperCase() === 'ANALYZED';
  const hasGraph = (graph.data?.nodes || []).length > 0;

  return (
    <div>
      <PageHeader
        title="Network graph"
        subtitle="Nodes and edges are supplied by GET /cases/{id}/graph. Layout is for display only; scores and links are not recalculated in the browser."
      />

      <FindingsPanel analyzed={analyzed} findings={anomalies.data || []} loading={anomalies.loading} />

      {!hasGraph ? (
        <EmptyState
          title="No graph data"
          description="Upload evidence and run analysis. The graph stays empty until the backend returns nodes."
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 h-[620px] bg-white border border-police-border">
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
              minZoom={0.2}
              maxZoom={1.8}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#cbd5e1" gap={18} />
              <Controls showInteractive={false} />
              <MiniMap
                nodeStrokeWidth={2}
                nodeColor={() => '#1e3a5f'}
                maskColor="rgba(248,250,252,0.7)"
              />
            </ReactFlow>
          </div>
          <aside className="xl:col-span-4 space-y-3">
            {selectedEdge && (
              <div className="bg-white border border-police-border p-3 text-sm">
                <h3 className="font-serif font-bold text-police-navy mb-2">Edge inspect</h3>
                <dl className="space-y-1 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-police-textDim">Type</dt>
                    <dd className="font-semibold">{selectedEdge.type}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-police-textDim">Label</dt>
                    <dd className="font-mono">{selectedEdge.label || '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-police-textDim">Source</dt>
                    <dd className="font-mono truncate">{selectedEdge.source}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-police-textDim">Target</dt>
                    <dd className="font-mono truncate">{selectedEdge.target}</dd>
                  </div>
                </dl>
              </div>
            )}
            <EntityDossier
              entity={selectedEntity}
              caseId={caseId}
              onClose={() => setSelectedEntity(null)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

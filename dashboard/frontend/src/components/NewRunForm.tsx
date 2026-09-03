import { useState } from 'react';
import type { ProjectsManifest } from '../api/types';

export function NewRunForm({
  manifest,
  onStart,
  starting,
}: {
  manifest: ProjectsManifest;
  onStart: (args: { env: string; project?: string; grep?: string }) => void;
  starting: boolean;
}) {
  const [env, setEnv] = useState(manifest.environments[0]?.value ?? 'qa');
  const [project, setProject] = useState<string>('');
  const [grep, setGrep] = useState('');

  return (
    <form
      className="card new-run-form"
      onSubmit={(e) => {
        e.preventDefault();
        onStart({ env, project: project || undefined, grep: grep || undefined });
      }}
    >
      <h3>Start a new run</h3>
      <div className="form-row">
        <label>
          Environment
          <select value={env} onChange={(e) => setEnv(e.target.value)}>
            {manifest.environments.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Project
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="">All projects</option>
            {manifest.projects.map((p) => (
              <option key={p.name} value={p.name}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grep-label">
          Grep / tag
          <input type="text" placeholder="@High" value={grep} onChange={(e) => setGrep(e.target.value)} />
        </label>
      </div>

      <div className="tag-quickpicks">
        {manifest.tags.map((t) => (
          <button type="button" key={t.value} className="filter-pill" onClick={() => setGrep(t.value)}>
            {t.value}
          </button>
        ))}
        {grep && (
          <button type="button" className="filter-pill" onClick={() => setGrep('')}>
            Clear
          </button>
        )}
      </div>

      <button type="submit" className="primary-button" disabled={starting}>
        {starting ? 'Starting…' : 'Start run'}
      </button>
    </form>
  );
}

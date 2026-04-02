import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';

export default function RegisterAgent() {
  const router = useRouter();
  const [form, setForm] = useState({
    user_id: 'user_demo01',
    name: '',
    endpoint_url: '',
    version: '1.0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const agent = await api.registerAgent(form);
      router.push(`/agents/${agent.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Register Agent</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {[
          { label: 'User ID', key: 'user_id', placeholder: 'user_demo01' },
          { label: 'Agent Name', key: 'name', placeholder: 'AggroBot 2' },
          { label: 'Endpoint URL', key: 'endpoint_url', placeholder: 'https://mybot.example.com/move or internal:aggrobot' },
          { label: 'Version', key: 'version', placeholder: '1.0' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-gray-400 block mb-1">{label}</label>
            <input
              type="text"
              placeholder={placeholder}
              value={form[key]}
              onChange={set(key)}
              required={key !== 'version'}
              className="w-full bg-[#0a0a1a] border border-[#2a2a4a] rounded-lg px-3 py-2 text-sm"
            />
          </div>
        ))}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register Agent'}
        </button>
      </form>

      <div className="card bg-violet-900/10 border-violet-800">
        <p className="text-xs text-gray-400">
          <strong className="text-violet-300">Internal DNA agents:</strong> Set endpoint URL to{' '}
          <code className="text-violet-300">internal:aggrobot</code>,{' '}
          <code className="text-violet-300">internal:smartbot</code>, or{' '}
          <code className="text-violet-300">internal:randombot</code> to use built-in behavior.
        </p>
      </div>
    </div>
  );
}

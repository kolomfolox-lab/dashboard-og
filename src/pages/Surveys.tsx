import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { marketingAPI } from '@/services/api';

export default function SurveysPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', title_uz: '', title_en: '', questions: [] as any[] });
  const [qForm, setQForm] = useState({ question: '', type: 'rating', options: '' });

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const [svRes, srRes] = await Promise.all([
        marketingAPI.getSurveyTemplates(workspace.selectedRestaurantId),
        marketingAPI.getSurveyResponses(workspace.selectedRestaurantId),
      ]);
      setSurveys(svRes.data.results || svRes.data || []);
      setResponses(srRes.data.results || srRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const addQuestion = () => {
    const q = { question: qForm.question, type: qForm.type };
    if (qForm.type === 'choice') (q as any).options = qForm.options.split(',').map(s => s.trim());
    setForm(f => ({ ...f, questions: [...f.questions, q] }));
    setQForm({ question: '', type: 'rating', options: '' });
  };

  const create = async () => {
    try {
      await marketingAPI.createSurveyTemplate({ ...form, restaurant: workspace.selectedRestaurantId });
      setShowForm(false);
      setForm({ title: '', title_uz: '', title_en: '', questions: [] });
      await load();
    } catch {}
  };

  const remove = async (id: string) => {
    try { await marketingAPI.deleteSurveyTemplate(id); await load(); } catch {}
  };

  return (
    <AppShell title={t('surveys_title', 'Surveys & NPS')} subtitle={t('surveys_subtitle', 'Create surveys and track Net Promoter Score from your guests.')} eyebrow={t('surveys_eyebrow', 'Waitly Marketing')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="grid gap-4 md:grid-cols-2 mb-5">
        <Panel title={t('surveys_templates_title', 'Survey templates')} eyebrow={t('surveys_templates_eyebrow', 'Active')} description={t('surveys_templates_desc', 'Configure NPS and guest satisfaction surveys.')}>
          <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? t('surveys_cancel', 'Cancel') : t('surveys_new', 'New survey')}
          </Button>
        </Panel>
        <Panel title={t('surveys_responses_title', 'Responses')} eyebrow={t('surveys_responses_eyebrow', 'Total')}>
          <div className="text-3xl font-bold text-theme">{responses.length}</div>
        </Panel>
      </div>

      {showForm ? (
        <Panel title={t('surveys_create_title', 'Create survey')} eyebrow={t('surveys_create_eyebrow', 'New')} className="mb-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('surveys_field_title_ru', 'Title (RU)')}</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('surveys_field_title_uz', 'Title (UZ)')}</label>
              <input value={form.title_uz} onChange={e => setForm(f => ({ ...f, title_uz: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-theme-secondary">{t('surveys_field_questions', 'Questions')}</label>
            <div className="mt-2 space-y-2">
              {form.questions.map((q, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-theme bg-theme-panel px-4 py-3 text-sm text-theme">
                  <span className="font-semibold">{i + 1}.</span>
                  <span>{q.question}</span>
                  <span className="ml-auto text-theme-secondary">({q.type})</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <input value={qForm.question} onChange={e => setQForm(f => ({ ...f, question: e.target.value }))}
                  placeholder={t('surveys_question_placeholder', 'Question text')}
                  className="w-full rounded-xl border border-theme bg-[var(--input-bg)] px-3 py-2 text-sm text-theme outline-none" />
              </div>
              <select value={qForm.type} onChange={e => setQForm(f => ({ ...f, type: e.target.value }))}
                className="rounded-xl border border-theme bg-[var(--input-bg)] px-3 py-2 text-sm text-theme outline-none">
                <option value="rating">{t('surveys_question_type_rating', 'Rating (1-5)')}</option>
                <option value="text">{t('surveys_question_type_text', 'Text')}</option>
                <option value="choice">{t('surveys_question_type_choice', 'Choice')}</option>
              </select>
              {qForm.type === 'choice' ? (
                <input value={qForm.options} onChange={e => setQForm(f => ({ ...f, options: e.target.value }))}
                  placeholder={t('surveys_question_options_placeholder', 'Option1,Option2')}
                  className="rounded-xl border border-theme bg-[var(--input-bg)] px-3 py-2 text-sm text-theme outline-none" />
              ) : null}
              <Button variant="secondary" size="sm" onClick={addQuestion}>{t('surveys_question_add', 'Add')}</Button>
            </div>
          </div>
          <div className="mt-5">
            <Button onClick={create}><ClipboardList className="mr-2 h-4 w-4" />{t('surveys_create_button', 'Create survey')}</Button>
          </div>
        </Panel>
      ) : null}

      <Panel title={t('surveys_templates_title', 'Survey templates')} eyebrow={t('surveys_eyebrow_templates', 'Templates')}>
        <DataTable
          columns={[
            { label: t('surveys_table_title', 'Title'), key: 'title' },
            { label: t('surveys_table_questions', 'Questions'), key: 'questions', render: (row) => (row.questions || []).length },
            { label: t('surveys_table_active', 'Active'), key: 'is_active', render: (row) => row.is_active ? <span className="text-emerald-400">{t('surveys_table_yes', 'Yes')}</span> : <span className="text-red-400">{t('surveys_table_no', 'No')}</span> },
            { label: '', key: 'id', render: (row) => (
              <Button variant="ghost" size="sm" onClick={() => remove(row.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
            )},
          ]}
          rows={surveys}
          emptyMessage={t('surveys_empty', 'No surveys created yet.')}
        />
      </Panel>

      <Panel title={t('surveys_responses_title', 'Survey responses')} eyebrow={t('surveys_responses_feedback', 'Feedback')} className="mt-5">
        <DataTable
          columns={[
            { label: t('surveys_responses_survey', 'Survey'), key: 'id', render: (row) => row.survey?.title || '—' },
            { label: t('surveys_responses_nps', 'NPS'), key: 'nps_score', render: (row) => row.nps_score != null ? row.nps_score : '—' },
            { label: t('surveys_responses_date', 'Date'), key: 'created_at', render: (row) => new Date(row.created_at).toLocaleString('ru-RU') },
          ]}
          rows={responses}
          emptyMessage={t('surveys_responses_empty', 'No responses yet.')}
        />
      </Panel>
    </AppShell>
  );
}

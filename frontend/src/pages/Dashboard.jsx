import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const PAGE_SIZE = 6;

function Dashboard() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeActionId, setActiveActionId] = useState('');
  const [loadingPage, setLoadingPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [editId, setEditId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [pendingDeleteNote, setPendingDeleteNote] = useState(null);

  const fetchNotes = async (requestedPage = 1, { showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoadingPage(requestedPage);
        setIsFetching(true);
      }

      const { data } = await API.get('/notes/getNotes', {
        params: {
          page: requestedPage,
          limit: PAGE_SIZE,
        },
      });

      const incomingNotes = Array.isArray(data?.data?.notes) ? data.data.notes : [];
      const total = Number(data?.data?.total) || 0;
      const limit = Number(data?.data?.limit) || PAGE_SIZE;
      const page = Number(data?.data?.page) || requestedPage;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      setNotes(incomingNotes);
      setPagination({ page, total, limit, totalPages });

      return {
        notes: incomingNotes,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Could not fetch your notes.',
      });

      return null;
    } finally {
      if (showLoader) {
        setIsFetching(false);
      }
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }

    fetchNotes(1);
  }, [navigate]);

  const addNote = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const title = newTitle.trim();
    const content = newContent.trim();

    if (!title || !content) {
      setStatus({ type: 'error', message: 'Both title and content are required.' });
      return;
    }

    try {
      setIsSaving(true);

      await API.post('/notes/createNote', {
        title,
        content,
      });

      setNewTitle('');
      setNewContent('');
      setStatus({ type: 'success', message: 'New note added. Showing page 1.' });
      await fetchNotes(1, { showLoader: true });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Could not add note.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (note) => {
    setEditId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setStatus({ type: '', message: '' });
  };

  const cancelEditing = () => {
    setEditId('');
    setEditTitle('');
    setEditContent('');
  };

  const updateNote = async () => {
    if (!editId) {
      return;
    }

    const title = editTitle.trim();
    const content = editContent.trim();

    if (!title || !content) {
      setStatus({ type: 'error', message: 'Updated title and content cannot be empty.' });
      return;
    }

    try {
      setActiveActionId(editId);

      await API.put(`/notes/updateNote/${editId}`, {
        title,
        content,
      });

      cancelEditing();
      setStatus({ type: 'success', message: 'Note updated. Showing page 1 with latest updates first.' });
      await fetchNotes(1, { showLoader: true });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Could not update note.',
      });
    } finally {
      setActiveActionId('');
    }
  };

  const openDeleteDialog = (note) => {
    setPendingDeleteNote(note);
    setStatus({ type: '', message: '' });
  };

  const closeDeleteDialog = () => {
    if (pendingDeleteNote?._id && activeActionId === pendingDeleteNote._id) {
      return;
    }

    setPendingDeleteNote(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteNote?._id) {
      return;
    }

    const id = pendingDeleteNote._id;

    try {
      setActiveActionId(id);
      await API.delete(`/notes/deleteNote/${id}`);

      if (editId === id) {
        cancelEditing();
      }

      setPendingDeleteNote(null);
      setStatus({ type: 'success', message: 'Note deleted.' });

      const result = await fetchNotes(pagination.page, { showLoader: false });
      if (result && result.notes.length === 0 && result.page > 1) {
        await fetchNotes(result.page - 1, { showLoader: true });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Could not delete note.',
      });
    } finally {
      setActiveActionId('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handlePageChange = async (nextPage) => {
    if (
      nextPage < 1
      || nextPage > pagination.totalPages
      || nextPage === pagination.page
      || isFetching
    ) {
      return;
    }

    setStatus({ type: '', message: '' });
    await fetchNotes(nextPage, { showLoader: true });
  };

  const pageNumbers = useMemo(() => {
    return Array.from({ length: pagination.totalPages }, (_, index) => index + 1);
  }, [pagination.totalPages]);

  const filteredNotes = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return notes;
    }

    return notes.filter((note) => {
      const title = note?.title?.toLowerCase() || '';
      const content = note?.content?.toLowerCase() || '';
      return title.includes(search) || content.includes(search);
    });
  }, [notes, query]);

  const isDeletingPending = pendingDeleteNote?._id && activeActionId === pendingDeleteNote._id;

  const formatDate = (value) => {
    if (!value) {
      return 'No timestamp';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'No timestamp';
    }

    return date.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute left-4 top-12 h-32 w-32 rounded-full bg-teal-300/35 blur-3xl float-slow" />
      <div
        className="pointer-events-none absolute bottom-0 right-8 h-40 w-40 rounded-full bg-orange-300/35 blur-3xl float-slow"
        style={{ animationDelay: '0.8s' }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="panel-surface reveal-up p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Personal Workspace</p>
              <h1 className="font-display mt-2 text-4xl text-slate-900 sm:text-5xl">Your Notes</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
                Capture ideas, keep everything organized, and edit quickly whenever your thoughts evolve.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700">
                {pagination.total} total notes
              </span>
              <span className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button onClick={handleLogout} className="ghost-btn" type="button">
                Logout
              </button>
            </div>
          </div>
        </header>

        {status.message ? (
          <div
            className={`status-banner reveal-up ${status.type === 'error' ? 'status-error' : 'status-success'}`}
          >
            {status.message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="panel-surface reveal-up p-5 sm:p-6" style={{ animationDelay: '0.06s' }}>
            <h2 className="font-display text-3xl text-slate-900">Add Note</h2>
            <p className="mt-1 text-sm text-slate-600">Give it a clear title and capture the details below.</p>

            <form className="mt-5 space-y-3" onSubmit={addNote}>
              <input
                type="text"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Meeting recap"
                className="input-field"
                maxLength={120}
              />

              <textarea
                value={newContent}
                onChange={(event) => setNewContent(event.target.value)}
                placeholder="Write your note here..."
                className="textarea-field"
                maxLength={1200}
              />

              <button type="submit" className="primary-btn w-full" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </aside>

          <section className="space-y-4">
            <div className="panel-surface reveal-up p-4 sm:p-5" style={{ animationDelay: '0.12s' }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notes by title or content"
                  className="input-field"
                />
                <button
                  type="button"
                  className="secondary-btn sm:whitespace-nowrap"
                  onClick={() => fetchNotes(pagination.page, { showLoader: true })}
                  disabled={isFetching}
                >
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {isFetching
                  ? `Loading page ${loadingPage}...`
                  : `Showing page ${pagination.page} of ${pagination.totalPages}`}
              </p>
            </div>

            {isFetching ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="panel-surface h-44 animate-pulse bg-white/55"
                    style={{ animationDelay: `${item * 0.06}s` }}
                  />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="panel-surface reveal-up p-8 text-center" style={{ animationDelay: '0.16s' }}>
                <h3 className="font-display text-3xl text-slate-800">No notes found</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {notes.length === 0
                    ? 'Create your first note from the left panel.'
                    : 'Try a different search term to find your notes.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredNotes.map((note, index) => (
                  <article
                    key={note._id}
                    className="panel-surface reveal-up flex h-full flex-col p-4"
                    style={{ animationDelay: `${Math.min(index * 0.05, 0.35)}s` }}
                  >
                    {editId === note._id ? (
                      <>
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          className="input-field"
                          maxLength={120}
                        />
                        <textarea
                          value={editContent}
                          onChange={(event) => setEditContent(event.target.value)}
                          className="textarea-field mt-2"
                          maxLength={1200}
                        />
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={updateNote}
                            className="secondary-btn"
                            type="button"
                            disabled={activeActionId === note._id}
                          >
                            {activeActionId === note._id ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={cancelEditing} className="ghost-btn" type="button">
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-display text-2xl leading-tight text-slate-900">{note.title}</h3>
                        <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                          {note.content}
                        </p>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Updated {formatDate(note.updatedAt || note.createdAt)}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button onClick={() => startEditing(note)} className="ghost-btn" type="button">
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteDialog(note)}
                            className="danger-btn"
                            type="button"
                            disabled={activeActionId === note._id || isFetching}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 ? (
              <div className="panel-surface reveal-up p-4 sm:p-5" style={{ animationDelay: '0.2s' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || isFetching}
                  >
                    Prev
                  </button>

                  <div className="flex flex-wrap gap-2">
                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={isFetching}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border px-3 text-sm font-semibold transition duration-200 ${
                          pageNumber === pagination.page
                            ? 'border-orange-500 bg-orange-500 text-white'
                            : 'border-slate-300/80 bg-white/70 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || isFetching}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {pendingDeleteNote ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={closeDeleteDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-note-title"
            className="panel-surface reveal-up w-full max-w-md p-6 sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Delete note</p>
            <h3 id="delete-note-title" className="font-display mt-2 text-3xl text-slate-900">
              Delete permanently?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              You are about to remove
              <span className="font-semibold text-slate-900"> "{pendingDeleteNote.title}"</span>.
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="ghost-btn"
                onClick={closeDeleteDialog}
                disabled={isDeletingPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={confirmDelete}
                disabled={isDeletingPending}
              >
                {isDeletingPending ? 'Deleting...' : 'Yes, delete permanently'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Dashboard;

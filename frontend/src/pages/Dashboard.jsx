import { use, useEffect, useState } from "react";
import API from "../api/axios";

function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [editId, setEditId] = useState(null); // ID of note being edited
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const fetchNotes = async () => {
    try {
      const { data } = await API.get("/notes/getNotes");

      setNotes(data.data.notes || []);
    } catch (err) {
      console.error("Could not fetch notes", err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/"; // redirect to login if no token
    }
    fetchNotes();
  }, []);

  const addNote = async () => {
    await API.post("/notes/createNote", {
      title: newTitle,
      content: newContent,
    });

    setNewTitle("");
    setNewContent("");

    fetchNotes();
  };

  const updateNote = async () => {
    try {
      setLoading(true);
      await API.put(`/notes/updateNote/${editId}`, {
        title: editTitle,
        content: editContent,
      });

      setEditId(null);
      fetchNotes();
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      await API.delete(`/notes/deleteNote/${id}`);

      fetchNotes(); // refresh list
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Notes</h2>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* Add Note */}
        <div className="flex gap-2 mb-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="border p-2 rounded w-1/3"
          />

          <input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Content"
            className="border p-2 rounded w-2/3"
          />

          <button
            onClick={addNote}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          {Array.isArray(notes) &&
            notes.map((note) => (
              <div key={note._id} className="border p-3 rounded bg-gray-50">
                {editId === note._id ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border p-1 w-full mb-1"
                    />

                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="border p-1 w-full mb-2"
                    />

                    <button
                      onClick={updateNote}
                      className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditId(null)}
                      className="bg-gray-400 px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold">{note.title}</h3>
                    <p className="text-gray-600">{note.content}</p>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditId(note._id);
                          setEditTitle(note.title);
                          setEditContent(note.content);
                        }}
                        className="bg-yellow-400 px-2 py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteNote(note._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

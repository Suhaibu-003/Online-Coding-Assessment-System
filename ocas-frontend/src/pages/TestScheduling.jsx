import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Users, Search, Check, Save, AlertCircle } from "lucide-react";
import {
  getTestWithAssignmentsApi,
  getCandidateUsersApi,
  assignTestToUsersApi,
} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function TestScheduling() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isPublicTest, setIsPublicTest] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        const [testRes, usersRes] = await Promise.all([getTestWithAssignmentsApi(testId), getCandidateUsersApi()]);

        setTest(testRes.data);
        setAllUsers(usersRes.data || []);
        setSelectedUserIds(testRes.data.assignedUsers?.map((u) => u._id) || []);
        setIsPublicTest(testRes.data.isPublicTest);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [testId]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;

    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    );
  }, [allUsers, searchQuery]);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const selectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) setSelectedUserIds([]);
    else setSelectedUserIds(filteredUsers.map((u) => u._id));
  };

  const handleSaveAssignments = async () => {
    if (!isPublicTest && selectedUserIds.length === 0) {
      setError("Please select at least one user for a private test");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await assignTestToUsersApi(testId, { userIds: selectedUserIds, isPublicTest });

      setSuccess("Test assignments saved successfully.");
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading schedule settings..." />;

  return (
    <div className="page-shell">
      <div className="container">
        <div className="mb-4 d-flex align-items-center gap-3">
          <button className="btn btn-outline-primary" onClick={() => navigate("/admin")}>
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="h4 mb-1 fw-bold">{test?.name}</h1>
            <p className="section-subtitle mb-0">Schedule this test for selected candidate groups.</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <AlertCircle size={16} className="me-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4" role="alert">
            <Check size={16} className="me-2" />
            {success}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="surface-card p-4 sticky-lg-top" style={{ top: "20px" }}>
              <h2 className="section-title mb-4">Test Configuration</h2>

              <div className="mb-3 pb-3 border-bottom">
                <div className="metric-label">Test Name</div>
                <div className="fw-semibold">{test?.name}</div>
              </div>

              <div className="mb-3 pb-3 border-bottom">
                <div className="metric-label">Duration</div>
                <div className="fw-semibold">{test?.durationMinutes} minutes</div>
              </div>

              <div className="mb-3 pb-3 border-bottom">
                <div className="metric-label">Questions</div>
                <div className="fw-semibold">{test?.questions?.length || 0}</div>
              </div>

              <h3 className="h6 fw-bold mt-4 mb-3">Test Availability</h3>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="testType"
                  id="publicTest"
                  checked={isPublicTest}
                  onChange={() => setIsPublicTest(true)}
                />
                <label className="form-check-label" htmlFor="publicTest">
                  <span className="fw-semibold">Public Test</span>
                  <div className="section-subtitle mt-1">Available to all candidates.</div>
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="testType"
                  id="privateTest"
                  checked={!isPublicTest}
                  onChange={() => setIsPublicTest(false)}
                />
                <label className="form-check-label" htmlFor="privateTest">
                  <span className="fw-semibold">Assign to Specific Users</span>
                  <div className="section-subtitle mt-1">Only selected users can access.</div>
                </label>
              </div>

              <div className="surface-card border-0 bg-light p-3 mt-4">
                <div className="metric-label">Assigned Users</div>
                <div className="mt-2">
                  {isPublicTest ? (
                    <span className="badge badge-soft-primary">All Candidates</span>
                  ) : selectedUserIds.length > 0 ? (
                    <span className="badge badge-soft-primary">{selectedUserIds.length} selected</span>
                  ) : (
                    <span className="badge badge-soft-warning">None selected</span>
                  )}
                </div>
              </div>

              <button
                className="btn btn-primary w-100 mt-4"
                onClick={handleSaveAssignments}
                disabled={saving || (!isPublicTest && selectedUserIds.length === 0)}
              >
                <Save size={15} className="me-2" />
                {saving ? "Saving..." : "Save Assignments"}
              </button>
            </div>
          </div>

          {!isPublicTest && (
            <div className="col-lg-8">
              <div className="surface-card p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Users size={19} className="text-primary" />
                  <h2 className="section-title mb-0">Select Users</h2>
                </div>

                <div className="input-group mb-4">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {filteredUsers.length > 0 && (
                  <div className="surface-card border-0 bg-light p-3 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="selectAllUsers"
                        checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={selectAllUsers}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="selectAllUsers">
                        {selectedUserIds.length === filteredUsers.length ? "Deselect All" : "Select All"}
                      </label>
                    </div>
                  </div>
                )}

                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="surface-card p-3 mb-2"
                        style={{ backgroundColor: selectedUserIds.includes(user._id) ? "#eff6ff" : "white" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            checked={selectedUserIds.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{user.name}</div>
                            <div className="section-subtitle small">{user.email}</div>
                          </div>
                          {selectedUserIds.includes(user._id) && <Check size={17} className="text-success" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state py-5">
                      {searchQuery ? "No users found for this search." : "No candidates available."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Users,
  Search,
  Check,
  Save,
  AlertCircle
} from "lucide-react";
import {
  getTestWithAssignmentsApi,
  getCandidateUsersApi,
  assignTestToUsersApi
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
        const [testRes, usersRes] = await Promise.all([
          getTestWithAssignmentsApi(testId),
          getCandidateUsersApi()
        ]);

        setTest(testRes.data);
        setAllUsers(usersRes.data || []);
        setSelectedUserIds(
          testRes.data.assignedUsers?.map((u) => u._id) || []
        );
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
    return allUsers.filter((user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [allUsers, searchQuery]);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u._id));
    }
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

      await assignTestToUsersApi(testId, {
        userIds: selectedUserIds,
        isPublicTest
      });

      setSuccess("Test assignments saved successfully!");
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div
      className="min-vh-100 py-4"
      style={{ background: "linear-gradient(135deg, #f8f9fa, #eef2f7)" }}
    >
      <div className="container">
        {/* Header */}
        <div className="mb-4 d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-primary rounded-3"
            onClick={() => navigate("/admin")}
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="mb-1 fw-bold">{test?.name}</h2>
            <p className="text-muted mb-0 small">Schedule this test for specific users</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <AlertCircle size={18} className="me-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4" role="alert">
            <Check size={18} className="me-2" />
            {success}
          </div>
        )}

        <div className="row g-4">
          {/* Test Configuration */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 sticky-lg-top" style={{ top: "20px" }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Test Configuration</h5>

                {/* Test Info */}
                <div className="mb-4 pb-4 border-bottom">
                  <div className="small text-muted mb-1">Test Name</div>
                  <div className="fw-semibold">{test?.name}</div>
                </div>

                <div className="mb-4 pb-4 border-bottom">
                  <div className="small text-muted mb-1">Duration</div>
                  <div className="fw-semibold">{test?.durationMinutes} minutes</div>
                </div>

                <div className="mb-4 pb-4 border-bottom">
                  <div className="small text-muted mb-1">Questions</div>
                  <div className="fw-semibold">{test?.questions?.length || 0} questions</div>
                </div>

                {/* Test Type Selection */}
                <h6 className="fw-bold mb-3 mt-4">Test Availability</h6>
                
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
                    <div className="text-muted small mt-1">
                      Available to all candidates in the portal
                    </div>
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
                    <div className="text-muted small mt-1">
                      Only selected users can access this test
                    </div>
                  </label>
                </div>

                {/* Summary */}
                <div className="alert alert-info mt-4 small">
                  <strong>Assigned Users:</strong>
                  <div className="mt-2">
                    {isPublicTest ? (
                      <span className="badge bg-primary">All Candidates</span>
                    ) : selectedUserIds.length > 0 ? (
                      <span className="badge bg-primary">{selectedUserIds.length} selected</span>
                    ) : (
                      <span className="badge bg-warning text-dark">None selected</span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100 rounded-3 mt-4"
                  onClick={handleSaveAssignments}
                  disabled={saving || (!isPublicTest && selectedUserIds.length === 0)}
                >
                  <Save size={16} className="me-2" />
                  {saving ? "Saving..." : "Save Assignments"}
                </button>
              </div>
            </div>
          </div>

          {/* User Selection */}
          {!isPublicTest && (
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <Users size={20} className="text-primary" />
                    <h5 className="mb-0 fw-bold">Select Users</h5>
                  </div>

                  {/* Search Bar */}
                  <div className="input-group mb-4 shadow-sm">
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Select All */}
                  {filteredUsers.length > 0 && (
                    <div className="mb-3 p-3 bg-light rounded-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllUsers"
                          checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                          indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length}
                          onChange={selectAllUsers}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="selectAllUsers">
                          {selectedUserIds.length === filteredUsers.length
                            ? "Deselect All"
                            : "Select All"}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* User List */}
                  <div className="user-list" style={{ maxHeight: "600px", overflowY: "auto" }}>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user._id}
                          className="card border-light mb-2"
                          style={{
                            backgroundColor: selectedUserIds.includes(user._id)
                              ? "#f0f8ff"
                              : "white"
                          }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-3">
                              <input
                                className="form-check-input mt-0"
                                type="checkbox"
                                checked={selectedUserIds.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                              />
                              <div className="flex-grow-1">
                                <div className="fw-semibold">{user.name}</div>
                                <div className="text-muted small">{user.email}</div>
                              </div>
                              {selectedUserIds.includes(user._id) && (
                                <Check size={18} className="text-success" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-5 text-muted">
                        {searchQuery ? "No users found" : "No candidates available"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

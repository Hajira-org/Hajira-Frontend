'use client';
import { useState, useEffect } from 'react';
import {
  DashboardWrapper,
  Sidebar,
  SidebarLink,
  MainContent,
  Card,
  CardTitle,
  CardContent,
  Input,
  Select,
  Button,
  FormContainer,
  InputGroup,
  CardActions,
} from '@/app/common/styledComponents';
import { useLogout } from '@/utils/logout';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PosterDashboardPage() {
  const [activePage, setActivePage] = useState("home");
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const logout = useLogout();

  // ---------------- JOB FORM ----------------
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    requirements: "",
    workModel: "Flexible",
  });

  const [profile, setProfile] = useState({ company: "", about: "", logo: "" });
  const [showApplicantsMap, setShowApplicantsMap] = useState<Record<string, boolean>>({});

  // Default job types
  const [jobTypes, setJobTypes] = useState([
    "Car Washing/Detailing (Mobile service)",
    "Lawn Mowing/Yard Work",
    "House Cleaning/Maid Service",
    "Pet Sitting/Dog Walking",
    "Handyperson/Small Repairs",
    "Errand Running/Personal Shopping",
    "Furniture Assembly",
    "Delivery Driver",
    "Tutoring",
    "Babysitting/Childcare",
    "Painting",
    "Gutter Cleaning",
    "Window Washing",
    "Pressure Washing",
    "Event Setup/Tear Down Helper",
    "Moving Help",
    "Welding",
    "Tire Changing/Basic Car Maintenance",
    "Simple Catering/Food Prep",
    "Gardening/Planting",
    "Snow Shoveling/Ice Removal",
    "Appliance Repair",
    "Notary Public",
    "Tailoring/Simple Clothes Alterations",
    "Hair Braiding/Simple Hairstyling",
    "Digital/Online Microtasks",
    "Online Surveys",
    "Data Entry",
    "Image Tagging/Annotation",
    "Audio Transcription",
    "Search Engine Evaluation",
    "Website/App Testing",
    "Content Moderation",
    "Social Media Engagement",
    "Short Writing Tasks",
    "Proofreading/Editing",
    "Quick Translations",
    "Data Verification",
    "Micro-Coding Tasks",
    "Typing CAPTCHAs/Data Categorization",
    "Virtual Assistant (VA) Quick Tasks",
    "Online Research",
    "Voice Recording/Narration",
    "Blog Commenting/Forum Posting",
    "Creating Simple Logos/Graphics",
    "Short Video Editing",
    "Baking/Selling Homemade Goods",
    "Selling Used Items Online",
    "Creating and Selling Simple Crafts",
    "Mystery Shopping/Store Audits",
    "Selling Digital Downloads"
  ]);

  const [customJob, setCustomJob] = useState("");

  // ---------------- FETCH JOBS ----------------
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    if (activePage === "home" || activePage === "myJobs") {
      fetchJobs();
      const interval = setInterval(fetchJobs, 5000);
      return () => clearInterval(interval);
    }
  }, [activePage]);

  const toggleApplicants = (jobId: string) => {
    setShowApplicantsMap(prev => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  // ---------------- DELETE JOB ----------------
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setJobs(prev => prev.filter(job => job._id !== jobId));
        alert("🗑️ Job deleted successfully.");
      } else {
        const data = await res.json();
        alert(data.message || "❌ Failed to delete job.");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("❌ Error deleting job.");
    }
  };

  // ---------------- RENDER PAGES ----------------
  const renderPage = () => {
    switch (activePage) {
      // ---------------- PROFILE ----------------
      case "profile":
        return (
          <Card>
            <CardTitle>Update Profile</CardTitle>
            <CardContent>
              <FormContainer
                onSubmit={async (e) => {
                  e.preventDefault();
                  const token = localStorage.getItem("token");

                  await fetch(`${API_URL}/api/profile`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(profile),
                  });
                  alert("Profile updated ✅");
                }}
              >
                <InputGroup>
                  <Input
                    placeholder="Company"
                    value={profile.company}
                    onChange={e => setProfile({ ...profile, company: e.target.value })}
                  />
                </InputGroup>

                <InputGroup>
                  <Input
                    as="textarea"
                    rows={3}
                    placeholder="About"
                    value={profile.about}
                    onChange={e => setProfile({ ...profile, about: e.target.value })}
                  />
                </InputGroup>

                <InputGroup>
                  <Input
                    placeholder="Logo URL"
                    value={profile.logo}
                    onChange={e => setProfile({ ...profile, logo: e.target.value })}
                  />
                </InputGroup>

                <Button type="submit">Save Profile</Button>
              </FormContainer>
            </CardContent>
          </Card>
        );

      // ---------------- CREATE JOB ----------------
      case "createJob":
        return (
          <Card style={{ background: "#0f172a", color: "#f8fafc", padding: "1.5rem" }}>
            <CardTitle style={{ fontSize: "1.3rem", fontWeight: 600 }}>
              🚀 Post a Quick Job
            </CardTitle>
            <CardContent>
              <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
                Post your task in under a minute — nearby workers will see it instantly.
              </p>

              <FormContainer
                onSubmit={async (e) => {
                  e.preventDefault();
                  const token = localStorage.getItem("token");

                  const res = await fetch(`${API_URL}/api/jobs`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      ...form,
                      requirements: form.requirements
                        ? form.requirements.split(",").map(r => r.trim())
                        : [],
                    }),
                  });

                  const data = await res.json();

                  if (res.ok) {
                    alert("✅ Job posted! Nearby workers can now see it.");
                    setForm({
                      title: "",
                      description: "",
                      location: "",
                      salary: "",
                      requirements: "",
                      workModel: "Flexible",
                    });
                    setActivePage("myJobs");
                  } else {
                    alert(data.message || "❌ Failed to post job.");
                  }
                }}
              >
                {/* STEP 1: Job Category */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem" }}>
                    What type of work?
                  </label>

                  <Select
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  >
                    <option value="">Select a job type</option>
                    {jobTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </Select>

                  {/* Add custom job type */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <Input
                      placeholder="Or add your own..."
                      value={customJob}
                      onChange={(e) => setCustomJob(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (!customJob.trim()) return;
                        if (!jobTypes.includes(customJob.trim())) {
                          setJobTypes([...jobTypes, customJob.trim()]);
                        }
                        setForm({ ...form, title: customJob.trim() });
                        setCustomJob("");
                      }}
                    >
                      ➕ Add
                    </Button>
                  </div>
                </div>

                {/* STEP 2: Description */}
                <InputGroup>
                  <Input
                    as="textarea"
                    rows={2}
                    placeholder="Describe briefly what you need done..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ resize: "none" }}
                  />
                </InputGroup>

                {/* STEP 3: Location & Offer */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem"
                }}>
                  <Input
                    placeholder="Location (e.g. Westlands)"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                  <Input
                    placeholder="Offer (e.g. 800 KSh)"
                    value={form.salary}
                    onChange={e => setForm({ ...form, salary: e.target.value })}
                  />
                </div>

                {/* STEP 4: Work Model */}
                <div style={{ marginTop: "1rem" }}>
                  <Select
                    value={form.workModel}
                    onChange={e => setForm({ ...form, workModel: e.target.value })}
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="Same Day">Same Day</option>
                    <option value="Scheduled">Scheduled</option>
                  </Select>
                </div>

                {/* Live Preview */}
                {form.title && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      backgroundColor: "#1e293b",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #334155",
                    }}
                  >
                    <h4 style={{ color: "#38bdf8", marginBottom: "0.3rem" }}>Preview:</h4>
                    <p><strong>{form.title}</strong> — {form.description || "No description yet."}</p>
                    <p>📍 {form.location || "No location"} | 💰 {form.salary || "Not set"}</p>
                    <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      Model: {form.workModel}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  style={{
                    marginTop: "1.2rem",
                    backgroundColor: "#3b82f6",
                    padding: "0.9rem 1.2rem",
                    fontWeight: 600,
                    fontSize: "1rem"
                  }}
                >
                  Post Job Instantly 🚀
                </Button>
              </FormContainer>
            </CardContent>
          </Card>
        );

      // ---------------- MY JOBS & HOME ----------------
      case "home":
      case "myJobs": {
        const filteredJobs = jobs.filter(job =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.description.toLowerCase().includes(search.toLowerCase()) ||
          job.location.toLowerCase().includes(search.toLowerCase())
        );

        return (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Search jobs, location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1'
                }}
              />
              <button
                onClick={fetchJobs}
                style={{
                  padding: "0.8rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Refresh
              </button>
            </div>

            {filteredJobs.length === 0 && (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>No jobs found.</p>
            )}

            {filteredJobs.map(job => (
              <Card key={job._id} style={{
                backgroundColor: "#1e293b",
                color: "#f1f5f9",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}>
                <CardTitle style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  {job.title}
                  {job.applications?.length > 0 && (
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8", marginLeft: "0.5rem" }}>
                      ({job.applications.length} applicants)
                    </span>
                  )}
                </CardTitle>

                <CardContent style={{ marginBottom: "1rem" }}>
                  <p style={{ color: "#cbd5e1", marginBottom: "0.5rem" }}>{job.description}</p>
                  <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>📍 {job.location}</p>
                  {job.salary && (
                    <p style={{ fontSize: "0.9rem", color: "#38bdf8", marginTop: "0.3rem" }}>
                      💰 {job.salary}
                    </p>
                  )}
                </CardContent>

                {/* Delete Button */}
                <CardActions style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="button"
                    style={{ backgroundColor: "#ef4444", padding: "0.5rem 0.9rem" }}
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    🗑️ Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </>
        );
      }

      default:
        return (
          <Card>
            <CardTitle>Welcome Back 👋</CardTitle>
            <CardContent>Use the sidebar to manage your jobs and profile.</CardContent>
          </Card>
        );
    }
  };

  // ---------------- MAIN RETURN ----------------
  return (
    <DashboardWrapper>
      <Sidebar>
        <SidebarLink as="button" $active={activePage === "home"} onClick={() => setActivePage("home")}>Home</SidebarLink>
        <SidebarLink as="button" $active={activePage === "profile"} onClick={() => setActivePage("profile")}>Profile</SidebarLink>
        <SidebarLink as="button" $active={activePage === "createJob"} onClick={() => setActivePage("createJob")}>Create Job</SidebarLink>
        <SidebarLink as="button" $active={activePage === "myJobs"} onClick={() => setActivePage("myJobs")}>My Jobs</SidebarLink>
        <SidebarLink as="button" $active={activePage === "settings"} onClick={() => setActivePage("settings")}>Settings</SidebarLink>
        <Button type="button" onClick={logout} style={{ marginTop: "auto", background: "#ef4444" }}>Logout</Button>
      </Sidebar>

      <MainContent>{renderPage()}</MainContent>
    </DashboardWrapper>
  );
}

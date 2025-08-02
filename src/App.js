import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', instructor: '', duration: '' });
  const [showForm, setShowForm] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const [courseRes, enrollRes] = await Promise.all([
        axios.get(`${API}/courses?ts=${ts}`),
        axios.get(`${API}/enrollments/me?ts=${ts}`)
      ]);
      setCourses(courseRes.data);
      const ids = enrollRes.data.map(e => e.courseId?._id).filter(Boolean);
      setEnrolledCourseIds(ids);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${API}/enrollments`, { courseId });
      await refreshData();
    } catch (err) {
      console.error('Enroll failed:', err);
    }
  };

  const handleAddCourse = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API}/courses`, newCourse);
      setNewCourse({ title: '', description: '', instructor: '', duration: '' });
      setShowForm(false);
      await refreshData();
    } catch (err) {
      console.error('Add course failed:', err);
    }
  };

  if (loading) return <div className="loading-message">Loading courses and enrollments…</div>;

  return (
    <div className="app-container">
      <h1 className="heading">Available Courses</h1>
      <button className="add-course-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add Course'}
      </button>
      {showForm && (
        <form className="course-form" onSubmit={handleAddCourse}>
          <input type="text" placeholder="Title" value={newCourse.title}
            onChange={e => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <textarea placeholder="Description" value={newCourse.description}
            onChange={e => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
            required
          />
          <input type="text" placeholder="Instructor" value={newCourse.instructor}
            onChange={e => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
            required
          />
          <input type="text" placeholder="Duration (e.g., 6 weeks)" value={newCourse.duration}
            onChange={e => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
            required
          />
          <button type="submit">Submit Course</button>
        </form>
      )}
      <div className="courses-container">
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          courses.map(course => (
            <div className="course-card" key={course._id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p><strong>Instructor:</strong> {course.instructor}</p>
              <p><strong>Duration:</strong> {course.duration}</p>
              <button
                disabled={enrolledCourseIds.includes(course._id)}
                onClick={() => handleEnroll(course._id)}
              >
                {enrolledCourseIds.includes(course._id) ? 'Enrolled' : 'Enroll'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

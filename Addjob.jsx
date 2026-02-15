import axios from "axios";

export default function AddJob() {
  const addJob = async () => {
    await axios.post("http://localhost:5000/api/jobs", {
      title: "MERN Developer",
      company: "Infosys",
      location: "India",
      description: "React + Node Developer"
    });
    alert("Job Added");
  };

  return (
    <div>
      <h3>Add Job</h3>
      <button onClick={addJob}>Add Job</button>
    </div>
  );
}
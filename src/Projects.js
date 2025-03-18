const projects = [
  { title: "Portfolio Website", description: "My personal website built with React.", link: "#" },
  { title: "Weather App", description: "A weather forecasting app using OpenWeather API.", link: "#" }
];

function Projects() {
  return (
    <section id="projects" style={{ padding: "20px", textAlign: "center" }}>
      <h2>My Projects</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {projects.map((project, index) => (
          <li key={index} style={{ marginBottom: "15px" }}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <a href={project.link} target="_blank" rel="noopener noreferrer">View Project</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Projects;
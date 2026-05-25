import "./Projects.css";

const projects = [
  {
    title: "Learn Bulgarian",
    description:
      "An interactive website for learning the Bulgarian language — vocabulary, grammar, and more.",
    link: "https://learnbulgarian.diyana.uk/",
    tag: "Live site",
  },
  {
    title: "Personal Website",
    description:
      "This portfolio site, built with React. A place to showcase my work and share what I'm up to.",
    link: "#",
    tag: "React",
  },
];

function Projects() {
  return (
    <section id="projects" className="projects-section">
      <div className="projects-inner">
        <h2 className="section-title">Projects</h2>
        <p className="section-subtitle">Things I've built</p>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.link}
              target={project.link.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="project-card"
            >
              <span className="project-tag">{project.tag}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <span className="project-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;

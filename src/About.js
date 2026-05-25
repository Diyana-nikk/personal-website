import "./About.css";

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-inner">
        <div className="about-avatar">D</div>
        <div className="about-text">
          <h1>Hi, I'm <span className="highlight">Diyana</span> 👋</h1>
          <p className="about-tagline">Developer · Language Enthusiast · Builder of Things</p>
          <p className="about-body">
            I love creating projects that combine technology with real-world utility.
            When I'm not coding, you'll find me working on language learning tools —
            including my very own site for learning Bulgarian!
          </p>
          <div className="about-links">
            <a href="#projects" className="btn-primary">See my work</a>
            <a href="#contact" className="btn-secondary">Get in touch</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

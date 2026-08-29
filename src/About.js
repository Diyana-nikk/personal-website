import "./About.css";
import logo from "./images/logo-dark.png";

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-inner">
        <div className="about-avatar">
          <img src={logo} alt="D" className="about-avatar-logo" />
        </div>
        <div className="about-text">
          <h1>Hi, I'm <span className="highlight">Diyana</span></h1>
          <p className="about-tagline">Developer · Dog lover · Hobby enthusiast</p>
          <p className="about-body">
            I love creating projects that combine technology with real-world utility.
            When I'm not coding, you'll find me playing board games!
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

import "./Contact.css";

function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-inner">
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-subtitle">I'd love to hear from you</p>
        <div className="contact-links">
          <a
            href="https://github.com/Diyana-nikk"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://learnbulgarian.diyana.uk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Bulgarian
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;

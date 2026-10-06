export default function OurStory() {
  return (
    <>
    <section className="story" id="historia" aria-labelledby="story-title">
      <div className="story-copy">
        <p className="eyebrow">UN SUEÑO QUE CRECIÓ EN FAMILIA</p>
        <h2 id="story-title">Tres hermanos.<br />Un sueño compartido.</h2>
        <p>Claudia, la menor de tres hermanos, siempre había soñado con tener su propia cafetería. Un día compartió esa idea con Romanet y Carlos, y lo que empezó como un deseo personal se convirtió en un proyecto de los tres.</p>
        <p>Con el apoyo de sus hermanos, Claudia logró abrir Lilas. Nuestra historia nace de esa unión: de creer en una idea, acompañarse y hacer realidad un sueño en familia.</p>
        <div className="story-signature"><span aria-hidden="true">♡</span> Claudia, Romanet y Carlos <span className="story-signature-note">La familia detrás de Lilas</span></div>
      </div>
      <div className="story-values">
        <article className="value-card">
          <span className="value-symbol" aria-hidden="true">✳</span>
          <h3>Nuestra misión</h3>
          <p>Acompañar tus días con bebidas y antojos preparados con cariño, una atención cercana y un espacio acogedor donde cada persona se sienta parte de la familia Lilas.</p>
        </article>
        <article className="value-card">
          <span className="value-symbol" aria-hidden="true">↗</span>
          <h3>Nuestra visión</h3>
          <p>Ser la cafetería favorita de nuestra comunidad: un punto de encuentro reconocido por sus sabores, su calidez y sus buenos momentos, creciendo sin perder nuestra esencia familiar.</p>
        </article>
      </div>
    </section>
    </>
  )
}

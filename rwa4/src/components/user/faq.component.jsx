import React from "react";
import "../../App.scss";

// Reusable component for the about section heading
function AboutHeading() {
  return <h2>About RideWealth Assistant</h2>;
}

// Reusable component for the about section paragraphs
function AboutParagraphs() {
  return (
    <p>
      This app is created and designed by a fellow ride share driver who also
      does web and app development. He was using a spreadsheet to manage his
      finances for his driving business. He saw a need for an app that would
      help him manage his business in a more modern way. There was a need to
      track his mileage, expenses, and income. This became RideWealth Assistant.{" "}
      <br />
      Using his experience with another small business and his experiences with
      estimated taxes, the functionality of estimating tax payments was added as
      well. While both estimates should help prevent owing any taxes, they are
      not a guarantee. The net income estimated tax is going to have a better
      chance of a return, while the gross income tax estimate will put you
      closer to even.
    </p>
  );
}

// Main AboutComponent combining the heading and paragraphs
function AboutComponent() {
  return (
    <div>
      <AboutHeading />
      <AboutParagraphs />
    </div>
  );
}

export default AboutComponent;
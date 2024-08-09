import React, { useState, useRef } from "react";
import { useAppContext } from "../../../Context/AppContext";
import Moveable from "react-moveable";
import "./BBOXSelector.css";

export default function BBOXSelector() {
  const navbarHeight = document.querySelector(".navbar").offsetHeight; // Get the height of the navbar
  const { setBbox } = useAppContext();
  const [target, setTarget] = useState(null);
  const [frame, setFrame] = useState({
    translate: [0, 0],
    rotate: 0,
    width: 100,
    height: 100,
  });
  const moveableRef = useRef(null);

  const handleDrag = ({ target, left, top }) => {
    target.style.left = `${left}px`;
    target.style.top = `${top}px`;
    updateBbox(left, top, frame.width, frame.height);
  };

  const handleResize = ({ target, width, height }) => {
    setFrame({ ...frame, width, height });
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
    updateBbox(
      parseFloat(target.style.left),
      parseFloat(target.style.top),
      width,
      height
    );
  };

  const updateBbox = (left, top, width, height) => {
    const adjustedLeft = left;
    const adjustedTop = top - navbarHeight;
    const adjustedRight = left + width;
    const adjustedBottom = top + height - navbarHeight;

    // Ensure values are valid numbers
    if (
      isNaN(adjustedLeft) ||
      isNaN(adjustedTop) ||
      isNaN(adjustedRight) ||
      isNaN(adjustedBottom)
    ) {
      // console.error("Invalid BBOX values:", {
      //   adjustedLeft,
      //   adjustedTop,
      //   adjustedRight,
      //   adjustedBottom,
      // });
      return;
    }

    // console.log("BBOX values:", {
    //   adjustedLeft,
    //   adjustedTop,
    //   adjustedRight,
    //   adjustedBottom,
    // });

    setBbox({
      left: adjustedLeft,
      top: adjustedTop,
      right: adjustedRight,
      bottom: adjustedBottom,
    });
  };

  return (
    <div className="app">
      <div
        className="rect"
        ref={setTarget}
        style={{
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          transform: `translate(${frame.translate[0]}px, ${frame.translate[1]}px) rotate(${frame.rotate}deg)`,
        }}
      />
      <Moveable
        ref={moveableRef}
        target={target}
        draggable={true}
        resizable={true}
        onDrag={handleDrag}
        onResize={handleResize}
      />
    </div>
  );
}

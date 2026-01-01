"use client";
import { ReactNode, useState } from "react";
import Icon from "./icons";

type AccordionProps = {
  summary: ReactNode;
  details: ReactNode;
};

export const Accordion = ({ summary, details }: AccordionProps) => {
  const [show, setShow] = useState<boolean>(false);

  /**
   * ドロップダウン表示切替
   */
  const toggleShow = () => {
    setShow(!show);
  };

  return (
    <div>
      <button
        className="flex items-center w-full cursor-pointer"
        onClick={toggleShow}
      >
        {summary}
        <div className="ml-auto">
          {!show ? <Icon name="expandMore" /> : <Icon name="expandLess" />}
        </div>
      </button>
      {show && details}
    </div>
  );
};

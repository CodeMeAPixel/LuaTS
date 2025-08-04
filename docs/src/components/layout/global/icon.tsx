import React from "react";
import { IconType } from "react-icons";

interface IconContainerProps {
  icon: IconType;
}

export const IconContainer: React.FC<IconContainerProps> = ({ icon: Icon }) => {
  return (
    <div className="icon-container">
      <Icon />
    </div>
  );
};

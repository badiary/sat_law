"use client";
import { useEffect, useState } from "react";
// import ImageComponent from "next/image";

type ImageBlockProps = {
  base64Image: string;
};

const ImageBlock = (props: ImageBlockProps) => {
  const { base64Image } = props;
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${base64Image}`;

    image.onload = function () {
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    };
  }, [base64Image]);

  return (
    <></>
    // <ImageComponent
    //   src={`data:image/jpeg;base64,${base64Image}`}
    //   alt="Description"
    //   width={imageSize.width}
    //   height={imageSize.height}
    // />
  );
};

export default ImageBlock;

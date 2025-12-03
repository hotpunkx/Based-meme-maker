import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { MemeCanvas } from "./MemeCanvas";

export const MemeGenerator = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(48);

  return (
    <div className="max-w-5xl mx-auto">
      {!uploadedImage ? (
        <ImageUpload onImageUpload={setUploadedImage} />
      ) : (
        <MemeCanvas
          imageUrl={uploadedImage}
          textColor={textColor}
          fontSize={fontSize}
          onColorChange={setTextColor}
          onFontSizeChange={setFontSize}
          setUploadedImage={setUploadedImage}
        />
      )}
    </div>
  );
};

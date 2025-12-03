import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, IText, Rect, Path } from "fabric";
import { Button } from "./ui/button";
import { Download, Type, Image, Trash2, Undo2, Redo2, Square, ArrowRight, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

interface MemeCanvasProps {
  imageUrl: string;
  textColor: string;
  fontSize: number;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  setUploadedImage: (url: string | null) => void;
}

export const MemeCanvas = ({ imageUrl, textColor, fontSize, onColorChange, onFontSizeChange, setUploadedImage }: MemeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const imageRef = useRef<FabricImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const isRedoing = useRef(false);
  const [textStrokeColor, setTextStrokeColor] = useState("#000000");
  const [textStrokeWidth, setTextStrokeWidth] = useState(2);

  const saveState = (canvas: FabricCanvas) => {
    if (isRedoing.current) return;
    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(json);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Calculate responsive canvas size with 16:9 aspect ratio
    const getCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 800); // 16px padding on each side
      const width = maxWidth;
      const height = Math.round(width * 9 / 16); // 16:9 aspect ratio
      return { width, height };
    };

    const { width, height } = getCanvasSize();
    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#f5f5f5",
    });

    setFabricCanvas(canvas);

    // Handle window resize
    const handleResize = () => {
      const { width, height } = getCanvasSize();
      canvas.setDimensions({ width, height });
      
      // Re-scale the background image if it exists
      if (imageRef.current) {
        const scale = Math.min(
          width / (imageRef.current.width || 1),
          height / (imageRef.current.height || 1)
        );
        imageRef.current.scale(scale);
        imageRef.current.set({
          left: (width - (imageRef.current.width || 0) * scale) / 2,
          top: (height - (imageRef.current.height || 0) * scale) / 2,
        });
      }
      
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    setFabricCanvas(canvas);

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON());
    setHistory([initialState]);
    setHistoryStep(0);

    // Track changes for undo/redo
    canvas.on("object:added", () => saveState(canvas));
    canvas.on("object:modified", () => saveState(canvas));
    canvas.on("object:removed", () => saveState(canvas));

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObject = canvas.getActiveObject();
        // Don't delete if user is editing text
        if (activeObject instanceof IText && activeObject.isEditing) {
          return;
        }
        if (activeObject && activeObject !== imageRef.current) {
          canvas.remove(activeObject);
          canvas.renderAll();
          toast.success("Object deleted");
        }
      }
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      const canvasWidth = fabricCanvas.width || 800;
      const canvasHeight = fabricCanvas.height || 450;

      const scale = Math.min(
        canvasWidth / (img.width || 1),
        canvasHeight / (img.height || 1)
      );

      img.scale(scale);
      img.set({
        left: (canvasWidth - (img.width || 0) * scale) / 2,
        top: (canvasHeight - (img.height || 0) * scale) / 2,
        selectable: true,
      });

      imageRef.current = img;
      fabricCanvas.clear();
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
    });
  }, [fabricCanvas, imageUrl]);

  const addText = () => {
    if (!fabricCanvas) return;

    const text = new IText("Your Text Here", {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
      stroke: textStrokeColor,
      strokeWidth: textStrokeWidth,
      selectable: true,
      editable: true,
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    toast.success("Text added! Drag to reposition, double-click to edit");
  };

  const addRectangle = () => {
    if (!fabricCanvas) return;
    const rect = new Rect({
      left: 150,
      top: 150,
      fill: textColor,
      width: 150,
      height: 100,
      stroke: textStrokeColor,
      strokeWidth: 2,
      selectable: true,
    });
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
    toast.success("Rectangle added! Drag corners to resize");
  };

  const addArrow = () => {
    if (!fabricCanvas) return;
    // Create arrow using Path
    const arrowPath = new Path("M 0 0 L 100 0 L 90 -10 M 100 0 L 90 10", {
      left: 150,
      top: 150,
      stroke: textColor,
      strokeWidth: 3,
      fill: "",
      strokeLineCap: "round",
      selectable: true,
    });
    fabricCanvas.add(arrowPath);
    fabricCanvas.setActiveObject(arrowPath);
    fabricCanvas.renderAll();
    toast.success("Arrow added! Drag to move and resize");
  };

  useEffect(() => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject instanceof IText) {
      activeObject.set({
        fill: textColor,
        fontSize: fontSize,
      });
      fabricCanvas.renderAll();
    }
  }, [textColor, fontSize, fabricCanvas]);

  const handleUndo = () => {
    if (!fabricCanvas || historyStep <= 0) return;
    const historyState = history[historyStep - 1];
    if (!historyState) return;
    
    isRedoing.current = true;
    
    fabricCanvas.loadFromJSON(JSON.parse(historyState)).then(() => {
      // Update the image reference to the first object (background image)
      const objects = fabricCanvas.getObjects();
      if (objects.length > 0 && objects[0] instanceof FabricImage) {
        imageRef.current = objects[0];
      }
      fabricCanvas.renderAll();
      setHistoryStep(historyStep - 1);
      isRedoing.current = false;
      toast.success("Undo applied");
    });
  };

  const handleRedo = () => {
    if (!fabricCanvas || historyStep >= history.length - 1) return;
    const historyState = history[historyStep + 1];
    if (!historyState) return;
    
    isRedoing.current = true;
    
    fabricCanvas.loadFromJSON(JSON.parse(historyState)).then(() => {
      // Update the image reference to the first object (background image)
      const objects = fabricCanvas.getObjects();
      if (objects.length > 0 && objects[0] instanceof FabricImage) {
        imageRef.current = objects[0];
      }
      fabricCanvas.renderAll();
      setHistoryStep(historyStep + 1);
      isRedoing.current = false;
      toast.success("Redo applied");
    });
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject !== imageRef.current) {
      fabricCanvas.remove(activeObject);
      fabricCanvas.renderAll();
      toast.success("Object deleted");
    } else if (activeObject === imageRef.current) {
      toast.error("Cannot delete background image");
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        img.scale(0.3);
        img.set({
          left: 100,
          top: 100,
          selectable: true,
        });
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
        toast.success("Image added! Drag to move, corners to resize");
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadMeme = () => {
    if (!fabricCanvas) return;

    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = dataURL;
    link.click();

    toast.success("Meme downloaded successfully!");
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* First Bar: Add image, new image, download */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button onClick={addImage} variant="outline" className="gap-2 flex-1 sm:flex-initial">
          <Image className="w-4 h-4" />
          <span className="hidden sm:inline">Add Image</span>
        </Button>
        <Button onClick={() => setUploadedImage(null)} variant="outline" className="gap-2 flex-1 sm:flex-initial">
          <ImagePlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Image</span>
        </Button>
        <Button onClick={downloadMeme} variant="secondary" className="gap-2 flex-1 sm:flex-initial">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </div>

      {/* Second Bar: Add text, rectangle, arrow */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button onClick={addText} className="gap-2 flex-1 sm:flex-initial">
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">Add Text</span>
        </Button>
        <Button onClick={addRectangle} variant="outline" className="gap-2 flex-1 sm:flex-initial">
          <Square className="w-4 h-4" />
          <span className="hidden sm:inline">Rectangle</span>
        </Button>
        <Button onClick={addArrow} variant="outline" className="gap-2 flex-1 sm:flex-initial">
          <ArrowRight className="w-4 h-4" />
          <span className="hidden sm:inline">Arrow</span>
        </Button>
      </div>

      {/* Third Bar: Text color, text outline, delete, undo, redo */}
      <div className="flex justify-center gap-2 items-center flex-wrap bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Label htmlFor="text-color" className="text-xs font-medium whitespace-nowrap">
            Text Color
          </Label>
          <input
            id="text-color"
            type="color"
            value={textColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="h-9 w-14 rounded border border-border cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="text-stroke-color" className="text-xs font-medium whitespace-nowrap">
            Outline
          </Label>
          <input
            id="text-stroke-color"
            type="color"
            value={textStrokeColor}
            onChange={(e) => setTextStrokeColor(e.target.value)}
            className="h-9 w-14 rounded border border-border cursor-pointer"
          />
        </div>
        <Button onClick={deleteSelected} variant="destructive" size="icon" className="h-9 w-9">
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button 
          onClick={handleUndo} 
          variant="outline" 
          size="icon"
          disabled={historyStep <= 0}
          className="h-9 w-9"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button 
          onClick={handleRedo} 
          variant="outline" 
          size="icon"
          disabled={historyStep >= history.length - 1}
          className="h-9 w-9"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Fourth Bar: Font size, outline width */}
      <div className="flex justify-center gap-4 items-center bg-muted/50 p-3 rounded-lg flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-xs">
          <Label htmlFor="font-size" className="text-xs font-medium whitespace-nowrap">
            Font Size
          </Label>
          <Slider
            id="font-size"
            value={[fontSize]}
            onValueChange={(value) => onFontSizeChange(value[0])}
            min={12}
            max={120}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8">{fontSize}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-xs">
          <Label htmlFor="text-stroke-width" className="text-xs font-medium whitespace-nowrap">
            Outline
          </Label>
          <Slider
            id="text-stroke-width"
            value={[textStrokeWidth]}
            onValueChange={(value) => setTextStrokeWidth(value[0])}
            min={0}
            max={10}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8">{textStrokeWidth}</span>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="border border-border rounded-lg overflow-hidden shadow-lg bg-card w-full max-w-[800px]">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Ctrl+Z to undo • Ctrl+Y to redo • Delete to remove • Drag to move • Double-click text to edit
      </p>
    </div>
  );
};

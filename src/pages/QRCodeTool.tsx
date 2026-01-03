import { AlertCircle, QrCode, Download, Upload, Palette, Lock, Image as ImageIcon, Settings2, Scan, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const QRCodeTool = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Generator State
  const [qrData, setQrData] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(300);
  const [border, setBorder] = useState(4);
  const [format, setFormat] = useState("png");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);

  // Scanner State
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [scanPassword, setScanPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [shouldAutoScan, setShouldAutoScan] = useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Auto-scan when file is uploaded
  useEffect(() => {
    if (shouldAutoScan && scanFile && !passwordRequired) {
      handleScanQR();
      setShouldAutoScan(false);
    }
  }, [scanFile, shouldAutoScan, passwordRequired]);

  // Show tooltip for 5s when enabling password protection
  useEffect(() => {
    if (usePassword) {
      setShowPasswordTooltip(true);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowPasswordTooltip(false);
      }, 3000);
    }
    // Cleanup on unmount
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, [usePassword]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file for the logo.",
          variant: "destructive",
        });
        return;
      }
      setLogo(file);
    }
  };

  const handleGenerateQR = async () => {
    if (!qrData.trim()) {
      toast({
        title: "Error",
        description: "Please enter data to generate QR code.",
        variant: "destructive",
      });
      return;
    }

    if (usePassword && !password) {
      toast({
        title: "Error",
        description: "Please enter a password for encryption.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("data", qrData);
      formData.append("fg_color", fgColor);
      formData.append("bg_color", bgColor);
      formData.append("size", qrSize.toString());
      formData.append("border", border.toString());
      formData.append("format", format);
      
      if (usePassword) {
        formData.append("password", password);
      }
      
      if (logo) {
        formData.append("logo", logo);
      }

      const response = await fetch(`${API_BASE_URL}/qr/generate-qr?data=${encodeURIComponent(qrData)}&fg_color=${encodeURIComponent(fgColor)}&bg_color=${encodeURIComponent(bgColor)}&size=${qrSize}&border=${border}&format=${format}${usePassword ? `&password=${encodeURIComponent(password)}` : ''}`, {
        method: "POST",
        body: logo ? formData : undefined,
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr_code.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success!",
        description: "QR code generated and downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleScanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file to scan.",
          variant: "destructive",
        });
        return;
      }
      setScanFile(file);
      setScanResult(null);
      setPasswordRequired(false);
      setScanPassword("");
      setShouldAutoScan(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanQR = async () => {
    if (!scanFile) {
      toast({
        title: "Error",
        description: "Please select an image to scan.",
        variant: "destructive",
      });
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("file", scanFile);
      
      if (scanPassword) {
        formData.append("password", scanPassword);
      }

      const response = await fetch(`${API_BASE_URL}/qr/scan-qr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to scan QR code");
      }

      const result = await response.json();

      if (result.password_required) {
        setPasswordRequired(true);
        toast({
          title: "Password Required",
          description: "This QR code is encrypted. Please enter the password.",
        });
      } else {
        setScanResult(result.data);
        setPasswordRequired(false);
        toast({
          title: "Success!",
          description: "QR code scanned successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to scan QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScanFile(null);
    setScanResult(null);
    setPasswordRequired(false);
    setScanPassword("");
    setScanPreview(null);
    if (scanInputRef.current) {
      scanInputRef.current.value = "";
    }
  };

  function LogoOverlay({ logo, qrSize }: { logo: File, qrSize: number }) {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Read the logo file as a data URL
    useEffect(() => {
      if (!logo) return;
      const reader = new FileReader();
      reader.onload = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(logo);
      
      return () => {
        setLogoUrl(null);
      };
    }, [logo]);

    if (!logoUrl) return null;

    // Backend logic: logo size = 1/6th of QR, border = logoSize/8, rounded
    const logoSize = Math.floor(qrSize / 6);
    const borderSize = Math.floor(logoSize / 8);
    const paddedSize = logoSize + 2 * borderSize;
    const radius = Math.floor(paddedSize / 5);

    return (
      <div
        style={{
          position: "absolute",
          left: `calc(50% - ${paddedSize / 2}px)`,
          top: `calc(50% - ${paddedSize / 2}px)`,
          width: paddedSize,
          height: paddedSize,
          background: "#fff",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 2px #fff",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        <img
          src={logoUrl}
          alt="Logo"
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: radius,
            objectFit: "cover",
          }}
        />
      </div>
    );
  }

  const handleDownloadPreviewQR = async () => {
    // Find the QRCodeCanvas element
    const qrCanvas = document.querySelector("canvas");
    if (!qrCanvas) return;

    const size = qrSize;
    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = size;
    combinedCanvas.height = size;
    const ctx = combinedCanvas.getContext("2d");
    if (!ctx) return;

    // Draw the QR code onto the new canvas
    ctx.drawImage(qrCanvas, 0, 0, size, size);

    // Helper to trigger download
    const triggerDownload = (dataUrl: string, ext: string) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr_code.${ext}`;
      link.click();
    };

    // If logo exists, draw it with smooth rounded border
    if (logo) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const logoImg = new window.Image();
        logoImg.onload = function () {
          const logoSize = Math.floor(size / 6);
          const borderSize = Math.floor(logoSize / 8);
          const paddedSize = logoSize + 2 * borderSize;
          const radius = Math.floor(paddedSize / 5);
          const x = (size - paddedSize) / 2;
          const y = (size - paddedSize) / 2;

          // Draw smooth white rounded rectangle as background
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + paddedSize - radius, y);
          ctx.quadraticCurveTo(x + paddedSize, y, x + paddedSize, y + radius);
          ctx.lineTo(x + paddedSize, y + paddedSize - radius);
          ctx.quadraticCurveTo(x + paddedSize, y + paddedSize, x + paddedSize - radius, y + paddedSize);
          ctx.lineTo(x + radius, y + paddedSize);
          ctx.quadraticCurveTo(x, y + paddedSize, x, y + paddedSize - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "rgba(0,0,0,0.01)";
          ctx.shadowBlur = 0.5;
          ctx.fill();
          ctx.restore();

          // Now clip to the *inner* rounded rectangle for the logo
          const logoRadius = Math.floor(logoSize / 5);
          const logoX = x + borderSize;
          const logoY = y + borderSize;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(logoX + logoRadius, logoY);
          ctx.lineTo(logoX + logoSize - logoRadius, logoY);
          ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + logoRadius);
          ctx.lineTo(logoX + logoSize, logoY + logoSize - logoRadius);
          ctx.quadraticCurveTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - logoRadius, logoY + logoSize);
          ctx.lineTo(logoX + logoRadius, logoY + logoSize);
          ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - logoRadius);
          ctx.lineTo(logoX, logoY + logoRadius);
          ctx.quadraticCurveTo(logoX, logoY, logoX + logoRadius, logoY);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(
            logoImg,
            logoX,
            logoY,
            logoSize,
            logoSize
          );
          ctx.restore();

          // Download in selected format
          if (format === "jpg" || format === "jpeg") {
            triggerDownload(combinedCanvas.toDataURL("image/jpeg", 0.95), "jpg");
          } else if (format === "pdf") {
            // Use jsPDF for PDF export
            import("jspdf").then(jsPDFModule => {
              const jsPDF = jsPDFModule.default;
              const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: [size, size],
              });
              pdf.addImage(
                combinedCanvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                size,
                size
              );
              pdf.save("qr_code.pdf");
            });
          } else {
            // Default to PNG
            triggerDownload(combinedCanvas.toDataURL("image/png"), "png");
          }
        };
        logoImg.src = e.target?.result as string;
      };
      reader.readAsDataURL(logo);
    } else {
      // No logo, just download the QR code in selected format
      if (format === "jpg" || format === "jpeg") {
        triggerDownload(combinedCanvas.toDataURL("image/jpeg", 0.95), "jpg");
      } else if (format === "pdf") {
        import("jspdf").then(jsPDFModule => {
          const jsPDF = jsPDFModule.default;
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: [size, size],
          });
          pdf.addImage(
            combinedCanvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            size,
            size
          );
          pdf.save("qr_code.pdf");
        });
      } else {
        triggerDownload(combinedCanvas.toDataURL("image/png"), "png");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file to scan.",
          variant: "destructive",
        });
        return;
      }
      setScanFile(file);
      setScanResult(null);
      setPasswordRequired(false);
      setScanPassword("");
      setShouldAutoScan(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container width-full px-2 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                QR Code Tool
              </h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-12">
            Generate custom QR codes and scan them with ease
          </p>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Scan QR Code
              </TabsTrigger>
            </TabsList>

            {/* Generate Tab */}
            <TabsContent value="generate">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      Configuration
                    </CardTitle>
                    <CardDescription>
                      Customize your QR code appearance and data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Data Input */}
                    <div className="space-y-2">
                      <Label htmlFor="qr-data" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Data / URL
                      </Label>
                      <Textarea
                        id="qr-data"
                        placeholder="Enter text, URL, or any data..."
                        value={qrData}
                        onChange={(e) => setQrData(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fg-color" className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Foreground
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="fg-color"
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bg-color" className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Background
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="bg-color"
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-16 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Size Slider */}
                    <div className="space-y-2">
                      <Label>Size: {qrSize}px</Label>
                      <Slider
                        value={[qrSize]}
                        onValueChange={([value]) => setQrSize(value)}
                        min={200}
                        max={800}
                        step={50}
                        className="w-full"
                      />
                    </div>

                    {/* Border Slider */}
                    <div className="space-y-2">
                      <Label>Border: {border}px</Label>
                      <Slider
                        value={[border]}
                        onValueChange={([value]) => setBorder(value)}
                        min={0}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Format Select */}
                    <div className="space-y-2">
                      <Label htmlFor="format">Output Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger id="format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpg">JPEG</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="logo" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Logo (Optional)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="logo"
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="flex-1"
                        />
                        {logo && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setLogo(null);
                              if (logoInputRef.current) {
                                logoInputRef.current.value = "";
                              }
                            }}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                      {logo && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {logo.name}
                        </p>
                      )}
                    </div>

                    {/* Password Protection */}
                    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="use-password" className="flex items-center gap-2 cursor-pointer relative">
                          <Lock className="h-4 w-4" />
                          Password Protection
                          <span
                            className="ml-2 relative"
                            onMouseEnter={() => setShowPasswordTooltip(true)}
                            onMouseLeave={() => { if (!usePassword) setShowPasswordTooltip(false); }}
                            tabIndex={0}
                            style={{ outline: "none" }}
                          >
                            <AlertCircle className="h-4 w-4 text-primary bg-muted rounded-full border border-primary" />
                            {showPasswordTooltip && (
                              <span
                                className="absolute left-7 top-1/2 -translate-y-1/2 z-10 bg-black text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap"
                                style={{ minWidth: 220 }}
                              >
                                This QR can only be scanned on this website with password
                              </span>
                            )}
                          </span>
                        </Label>
                        <Switch
                          id="use-password"
                          checked={usePassword}
                          onCheckedChange={setUsePassword}
                        />
                      </div>
                      {usePassword && (
                        <Input
                          type="password"
                          placeholder="Enter encryption password..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      )}
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={usePassword ? handleGenerateQR : handleDownloadPreviewQR}
                      disabled={generating || !qrData.trim()}
                      className="w-full"
                      size="lg"
                    >
                      {generating && usePassword ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate & Download
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Preview Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preview & Info</CardTitle>
                    <CardDescription>
                      Your QR code will be generated with these settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center min-h-[300px] relative">
                      <div className="text-center space-y-4 relative inline-block">
                        {qrData ? (
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <QRCodeCanvas
                              value={qrData}
                              size={qrSize}
                              bgColor={bgColor}
                              fgColor={fgColor}
                              level="H"
                              includeMargin={border > 0}
                              style={{
                                border: border ? `${border}px solid ${bgColor}` : undefined,
                                borderRadius: 8,
                                background: bgColor,
                              }}
                            />
                            {logo && (
                              <LogoOverlay
                                logo={logo}
                                qrSize={qrSize}
                              />
                            )}
                          </div>
                        ) : (
                          <>
                            <QrCode className="h-24 w-24 mx-auto text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                              Click "Generate & Download" to create your QR code
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Current Settings</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span className="text-muted-foreground">Size:</span>
                          <Badge variant="secondary">{qrSize}px</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span className="text-muted-foreground">Format:</span>
                          <Badge variant="secondary">{format.toUpperCase()}</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span className="text-muted-foreground">Border:</span>
                          <Badge variant="secondary">{border}px</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span className="text-muted-foreground">Logo:</span>
                          <Badge variant="secondary">{logo ? "Yes" : "No"}</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded col-span-2">
                          <span className="text-muted-foreground">Encrypted:</span>
                          <Badge variant={usePassword ? "default" : "secondary"}>
                            {usePassword ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {qrData && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Data Preview</h4>
                        <div className="p-3 bg-muted rounded text-sm break-all max-h-32 overflow-y-auto">
                          {qrData}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Scan Tab */}
            <TabsContent value="scan">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload QR Code
                    </CardTitle>
                    <CardDescription>
                      Select or drag an image containing a QR code to scan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className="space-y-4 border-2 border-dashed rounded-lg p-4 bg-muted/50 cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={e => {
                        if (e.target === e.currentTarget) {
                          scanInputRef.current?.click();
                        }
                      }}
                      style={{ minHeight: 120 }}
                    >
                      <Input
                        ref={scanInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleScanFileChange}
                        style={{ display: "none" }}
                      />
                      <div className="text-center text-muted-foreground">
                        Drag & drop or click to upload QR code image
                      </div>
                      {scanPreview && (
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <img
                            src={scanPreview}
                            alt="QR Code Preview"
                            className="max-h-64 mx-auto rounded"
                          />
                        </div>
                      )}
                      {passwordRequired && (
                        <div className="space-y-2 p-4 border border-primary rounded-lg bg-primary/5">
                          <Label htmlFor="scan-password" className="flex items-center gap-2 text-primary">
                            <Lock className="h-4 w-4" />
                            This QR code is encrypted
                          </Label>
                          <Input
                            id="scan-password"
                            type="password"
                            placeholder="Enter decryption password..."
                            value={scanPassword}
                            onChange={(e) => setScanPassword(e.target.value)}
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        {passwordRequired && (
                          <Button
                            onClick={handleScanQR}
                            disabled={scanning || !scanFile}
                            className="flex-1"
                            size="lg"
                          >
                            {scanning ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <Scan className="mr-2 h-4 w-4" />
                                Scan QR Code
                              </>
                            )}
                          </Button>
                        )}
                        {(scanFile || scanResult) && (
                          <Button
                            onClick={resetScanner}
                            variant="outline"
                            size="lg"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Result Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scan Result</CardTitle>
                    <CardDescription>
                      Extracted data from the QR code
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {scanResult ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
                              <QrCode className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-semibold text-green-900 dark:text-green-100">
                                Successfully Scanned!
                              </h4>
                              <div className="p-3 bg-white dark:bg-gray-900 rounded border border-green-200 dark:border-green-800">
                                <p className="text-sm break-all whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                                  {scanResult}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(scanResult);
                                  toast({
                                    title: "Copied!",
                                    description: "Result copied to clipboard.",
                                  });
                                }}
                                className="w-full"
                              >
                                Copy to Clipboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                        <div className="text-center space-y-4">
                          <Scan className="h-24 w-24 mx-auto text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            Upload or drag & drop an image to automatically scan the QR code
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default QRCodeTool;

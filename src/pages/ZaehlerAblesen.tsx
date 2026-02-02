import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, Zap, Flame, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { meterReadingSchema, type MeterReadingFormData } from "@/lib/validation";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";

const meterTypes = [
  { value: "strom", label: "Strom", icon: Zap, unit: "kWh", color: "bg-warning" },
  { value: "gas", label: "Gas", icon: Flame, unit: "m³", color: "bg-destructive" },
  { value: "kaltwasser", label: "Kaltwasser", icon: Droplets, unit: "m³", color: "bg-info" },
  { value: "warmwasser", label: "Warmwasser", icon: Droplets, unit: "m³", color: "bg-destructive" },
];

export default function ZaehlerAblesen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    meterType: "",
    value: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mock previous readings
  const previousReadings: Record<string, number> = {
    strom: 12456,
    gas: 3421,
    kaltwasser: 156,
    warmwasser: 89,
  };

  const selectedMeter = meterTypes.find(m => m.value === formData.meterType);
  const previousValue = formData.meterType ? previousReadings[formData.meterType] : null;
  const consumption = formData.value && previousValue 
    ? parseFloat(formData.value) - previousValue 
    : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!user) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um einen Zählerstand zu übermitteln.",
      });
      return;
    }

    const numericValue = parseFloat(formData.value);
    
    // Validate form data with Zod schema
    const validationResult = meterReadingSchema.safeParse({
      meter_type: formData.meterType,
      value: isNaN(numericValue) ? undefined : numericValue,
      previous_value: previousValue ?? undefined,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({
        variant: "destructive",
        title: "Validierungsfehler",
        description: "Bitte überprüfen Sie Ihre Eingaben.",
      });
      return;
    }

    // Additional business logic validation
    if (consumption !== null && consumption < 0) {
      setValidationErrors({ value: "Der neue Zählerstand kann nicht kleiner sein als der vorherige." });
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der neue Zählerstand kann nicht kleiner sein als der vorherige.",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if provided
      if (formData.image) {
        try {
          const uploadResult = await uploadImage(formData.image, "meter-images", user.id);
          imageUrl = uploadResult.path;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast({
            variant: "destructive",
            title: "Bild-Upload fehlgeschlagen",
            description: uploadError instanceof Error ? uploadError.message : "Fehler beim Hochladen des Bildes.",
          });
          setLoading(false);
          return;
        }
      }

      // Insert meter reading into database with validated data
      const { error: insertError } = await supabase.from("meter_readings").insert({
        user_id: user.id,
        meter_type: validationResult.data.meter_type,
        value: validationResult.data.value,
        previous_value: previousValue,
        image_url: imageUrl,
        source: "manual",
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Fehler beim Speichern des Zählerstands.");
      }

      toast({
        title: "Zählerstand übermittelt",
        description: `${selectedMeter?.label}-Zählerstand wurde erfolgreich gespeichert.`,
      });

      navigate("/");
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Zähler ablesen</h1>
            <p className="text-white/80 text-sm">Zählerstand eingeben</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meter Type Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Zählertyp wählen *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {meterTypes.map((meter) => {
                  const Icon = meter.icon;
                  const isSelected = formData.meterType === meter.value;
                  return (
                    <Button
                      key={meter.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto py-3 flex flex-col items-center gap-1 ${isSelected ? "" : ""}`}
                      onClick={() => setFormData({ ...formData, meterType: meter.value, value: "" })}
                    >
                      <div className={`w-8 h-8 rounded-full ${meter.color} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm">{meter.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Previous Reading & Input */}
          {formData.meterType && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Zählerstand eingeben *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Previous Reading */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vorheriger Stand:</span>
                    <span className="font-medium">
                      {previousValue?.toLocaleString('de-DE')} {selectedMeter?.unit}
                    </span>
                  </div>
                </div>

                {/* Current Reading Input */}
                <div className="space-y-2">
                  <Label htmlFor="value">Aktueller Zählerstand ({selectedMeter?.unit})</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder={`z.B. ${(previousValue || 0) + 100}`}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className={`text-lg ${validationErrors.value || validationErrors.meter_type ? "border-destructive" : ""}`}
                    min="0"
                    step="0.001"
                  />
                  {(validationErrors.value || validationErrors.meter_type) && (
                    <p className="text-sm text-destructive">{validationErrors.value || validationErrors.meter_type}</p>
                  )}
                </div>

                {/* Calculated Consumption */}
                {consumption !== null && consumption >= 0 && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-success">Verbrauch seit letzter Ablesung:</span>
                      <span className="font-bold text-success">
                        {consumption.toLocaleString('de-DE')} {selectedMeter?.unit}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Photo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Foto des Zählers (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Zähler Vorschau" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                  >
                    Entfernen
                  </Button>
                </div>
              ) : (
                <Label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Zähler fotografieren</span>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={loading || !formData.meterType || !formData.value}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "Zählerstand übermitteln"
            )}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}

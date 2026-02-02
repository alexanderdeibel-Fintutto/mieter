import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { issueSchema, type IssueFormData } from "@/lib/validation";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { value: "sanitaer", label: "Sanitär" },
  { value: "elektrik", label: "Elektrik" },
  { value: "heizung", label: "Heizung" },
  { value: "fenster_tueren", label: "Fenster & Türen" },
  { value: "wasserschaden", label: "Wasserschaden" },
  { value: "schimmel", label: "Schimmel" },
  { value: "sonstiges", label: "Sonstiges" },
];

const priorities = [
  { value: "niedrig", label: "Niedrig", color: "bg-success" },
  { value: "mittel", label: "Mittel", color: "bg-warning" },
  { value: "hoch", label: "Hoch", color: "bg-destructive" },
  { value: "notfall", label: "Notfall", color: "bg-destructive animate-pulse" },
];

export default function MangelMelden() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    priority: "mittel",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        description: "Sie müssen angemeldet sein, um einen Mangel zu melden.",
      });
      return;
    }

    // Validate form data with Zod schema
    const validationResult = issueSchema.safeParse({
      category: formData.category,
      description: formData.description,
      priority: formData.priority,
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

    setLoading(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if provided
      if (formData.image) {
        try {
          const uploadResult = await uploadImage(formData.image, "issue-images", user.id);
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

      // Insert issue into database with validated data
      const { error: insertError } = await supabase.from("issues").insert({
        user_id: user.id,
        category: validationResult.data.category,
        description: validationResult.data.description,
        priority: validationResult.data.priority,
        image_url: imageUrl,
        status: "offen",
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Fehler beim Speichern des Mangels.");
      }

      toast({
        title: "Mangel gemeldet",
        description: "Ihre Meldung wurde erfolgreich übermittelt.",
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
            <h1 className="text-xl font-bold text-white">Mangel melden</h1>
            <p className="text-white/80 text-sm">Beschreiben Sie das Problem</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Kategorie *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className={validationErrors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.category && (
                <p className="text-sm text-destructive mt-1">{validationErrors.category}</p>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Beschreibung *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Beschreiben Sie den Mangel detailliert (mind. 10 Zeichen)..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={validationErrors.description ? "border-destructive" : ""}
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                {validationErrors.description && (
                  <p className="text-sm text-destructive">{validationErrors.description}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {formData.description.length}/2000
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dringlichkeit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {priorities.map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    variant={formData.priority === p.value ? "default" : "outline"}
                    className={formData.priority === p.value ? "border-2 border-primary" : ""}
                    onClick={() => setFormData({ ...formData, priority: p.value })}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.color} mr-2`} />
                    {p.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Foto (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Vorschau" 
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
                  <span className="text-sm text-muted-foreground">Foto aufnehmen oder hochladen</span>
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
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "Mangel melden"
            )}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}

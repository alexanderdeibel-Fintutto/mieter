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
  const [loading, setLoading] = useState(false);
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
    
    if (!formData.category || !formData.description) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
      return;
    }

    setLoading(true);

    // TODO: Submit to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Mangel gemeldet",
      description: "Ihre Meldung wurde erfolgreich übermittelt.",
    });

    navigate("/");
    setLoading(false);
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
                <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Beschreibung *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Beschreiben Sie den Mangel detailliert..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
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

import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Wand2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserCustomEffect } from '@shared/schema';

const Effects = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: customEffects = [], isLoading } = useQuery<UserCustomEffect[]>({
    queryKey: ['/api/custom-effects'],
    refetchOnWindowFocus: false,
  });

  // Check if current user is admin
  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ['/api/admin/check', user?.email],
    enabled: !!user?.email,
    refetchOnWindowFocus: false,
  });

  const isAdmin = adminCheck?.isAdmin || false;

  // Delete effect mutation
  const deleteEffectMutation = useMutation({
    mutationFn: async (effectId: string) => {
      return apiRequest('DELETE', `/api/user-custom-effects/${effectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-effects'] });
      toast({
        title: "Effect deleted",
        description: "The custom effect has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete the effect. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUseEffect = (effectName: string) => {
    setLocation(`/text-to-image?effect=${encodeURIComponent(effectName)}`);
  };

  const handleDeleteEffect = (effectId: string, effectName: string) => {
    if (confirm(`Are you sure you want to delete "${effectName}"? This action cannot be undone.`)) {
      deleteEffectMutation.mutate(effectId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2" data-testid="text-effects-title">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Effects Marketplace
          </h1>
          <p className="text-muted-foreground" data-testid="text-effects-description">
            Discover and explore custom visual effects created by the community
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : customEffects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No custom effects yet
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Be the first to create a custom effect! Go to the Text-to-Image page and click "Create Custom Effect" below the Effects dropdown.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customEffects.map((effect) => (
              <Card key={effect.id} className="hover:shadow-lg transition-shadow" data-testid={`card-effect-${effect.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    {effect.name}
                  </CardTitle>
                  {effect.description && (
                    <CardDescription>{effect.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {effect.visualImpact && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Visual Impact</h4>
                      <p className="text-sm text-muted-foreground">{effect.visualImpact}</p>
                    </div>
                  )}
                  {effect.technicalDetails && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Technical Details</h4>
                      <p className="text-sm text-muted-foreground">{effect.technicalDetails}</p>
                    </div>
                  )}
                  {effect.useCases && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Use Cases</h4>
                      <p className="text-sm text-muted-foreground">{effect.useCases}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(effect.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUseEffect(effect.name)}
                        className="flex-1"
                        variant="default"
                        data-testid={`button-use-effect-${effect.id}`}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Use this effect
                      </Button>
                      {isAdmin && (
                        <Button
                          onClick={() => handleDeleteEffect(effect.id, effect.name)}
                          variant="destructive"
                          size="icon"
                          disabled={deleteEffectMutation.isPending}
                          data-testid={`button-delete-effect-${effect.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Effects;

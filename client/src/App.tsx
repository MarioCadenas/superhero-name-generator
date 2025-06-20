
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { SuperheroName, GenerateSuperheroNameInput } from '../../server/src/schema';

function App() {
  const [superheroNames, setSuperheroNames] = useState<SuperheroName[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<GenerateSuperheroNameInput>({
    realName: '',
    keyword: ''
  });

  // Load superhero names
  const loadSuperheroNames = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getSuperheroNames.query({ limit: 20 });
      setSuperheroNames(result);
    } catch (error) {
      console.error('Failed to load superhero names:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadSuperheroNames();
  }, [loadSuperheroNames]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await trpc.generateSuperheroName.mutate(formData);
      // Add new superhero name to the top of the list
      setSuperheroNames((prev: SuperheroName[]) => [response, ...prev]);
      // Reset form
      setFormData({
        realName: '',
        keyword: ''
      });
    } catch (error) {
      console.error('Failed to generate superhero name:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🦸‍♂️ Superhero Name Generator 🦸‍♀️
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your identity into a legendary superhero name!
          </p>
        </div>

        {/* Generation Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ Create Your Superhero Identity
            </CardTitle>
            <CardDescription>
              Enter your real name and a keyword that represents your superpower or personality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="realName" className="text-sm font-medium text-gray-700">
                    Real Name
                  </label>
                  <Input
                    id="realName"
                    placeholder="e.g., Peter Parker"
                    value={formData.realName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: GenerateSuperheroNameInput) => ({ ...prev, realName: e.target.value }))
                    }
                    required
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="keyword" className="text-sm font-medium text-gray-700">
                    Superpower/Keyword
                  </label>
                  <Input
                    id="keyword"
                    placeholder="e.g., Spider, Fire, Shadow"
                    value={formData.keyword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: GenerateSuperheroNameInput) => ({ ...prev, keyword: e.target.value }))
                    }
                    required
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    🚀 Generate Superhero Name
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Hall of Heroes
            </CardTitle>
            <CardDescription>
              Recently generated superhero identities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading heroes...</span>
              </div>
            ) : superheroNames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🦸‍♂️</div>
                <p className="text-gray-500">No heroes yet! Generate your first superhero name above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {superheroNames.map((hero: SuperheroName) => (
                  <div key={hero.id} className="group">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {hero.superhero_name}
                          </h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                            Hero #{hero.id}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            👤 <strong>Real Identity:</strong> {hero.real_name}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1">
                            ⚡ <strong>Power:</strong> {hero.keyword}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1">
                            📅 <strong>Created:</strong> {hero.created_at.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        🦸‍♂️
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>✨ Every hero needs an epic name. Create yours today! ✨</p>
        </div>
      </div>
    </div>
  );
}

export default App;

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookText, Code, Drama, Globe, MessageCircle, PenTool, Plane, Search } from 'lucide-react';
import Link from 'next/link';

const exploreItems = [
  {
    title: 'Creative Writer',
    description: 'Generate stories, poems, and scripts.',
    icon: PenTool,
    category: 'Writing',
    color: 'text-blue-500',
  },
  {
    title: 'Code Helper',
    description: 'Debug code, write functions, and learn programming.',
    icon: Code,
    category: 'Development',
    color: 'text-green-500',
  },
  {
    title: 'Vacation Planner',
    description: 'Plan your next trip with itineraries and recommendations.',
    icon: Plane,
    category: 'Travel',
    color: 'text-purple-500',
  },
  {
    title: 'Language Tutor',
    description: 'Translate languages and practice conversations.',
    icon: Globe,
    category: 'Education',
    color: 'text-orange-500',
  },
  {
    title: 'Summarizer',
    description: 'Get the key points from long articles and documents.',
    icon: BookText,
    category: 'Productivity',
    color: 'text-red-500',
  },
  {
    title: 'Roleplay Partner',
    description: 'Engage in dynamic and creative roleplaying scenarios.',
    icon: Drama,
    category: 'Fun',
    color: 'text-yellow-500',
  },
  {
    title: 'Web Searcher',
    description: 'Get real-time answers from the web.',
    icon: Search,
    category: 'Productivity',
    color: 'text-indigo-500',
  },
  {
    title: 'Friendly Chatbot',
    description: 'Just have a friendly and engaging conversation.',
    icon: MessageCircle,
    category: 'Fun',
    color: 'text-pink-500',
  },
];

export default function ExplorePage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Explore</h2>
          <p className="text-muted-foreground">
            Discover different ways to interact with Dharz AI.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exploreItems.map((item, index) => (
            <Link href="/" key={index}>
                <Card className="hover:bg-muted/50 transition-colors h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                        <Badge variant="outline" className="mt-4">{item.category}</Badge>
                    </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

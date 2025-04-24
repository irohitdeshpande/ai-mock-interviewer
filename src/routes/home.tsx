import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Zap, Target, BarChart2, UserCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HomePage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isSignedIn) {
      navigate("/interview");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">

      {/* Hero Section */}
      <section id = "landing" className="w-full py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm mb-4">
                AI-Powered Interview Prep
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-4">
                Ace Every Interview with <span className="text-indigo-600">AI-Powered</span> Precision
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Your AI mentor for interview success. Practice with realistic scenarios, get real-time feedback, and boost your confidence like never before.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6"
              >
                {isSignedIn ? "Take an Interview" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-indigo-${300 + i * 100}`}></div>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-800">100+</span> professionals improved their interview skills this week
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="relative bg-white rounded-xl shadow-xl p-6 border border-slate-200">
              <div className="absolute -top-3 -right-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                Live Demo
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="font-medium text-slate-800">Software Engineer Interview</div>
                  <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">In Progress</div>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <p className="text-sm font-medium text-slate-700">Tell me about a challenging project you worked on.</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-700">In my previous role, I led the development of a real-time analytics dashboard that...</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <p className="text-sm font-medium text-green-800">Strong response</p>
                    </div>
                    <p className="text-xs text-green-700">Great job highlighting your leadership and technical skills. Consider adding more specific metrics about the project's impact.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Features to Transform Your Interview Skills</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with personalized coaching to help you nail every interview.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-6 w-6 text-indigo-600" />,
                title: "AI-Powered Mock Interviews",
                description: "Practice with our intelligent AI interviewer that adapts questions based on your responses."
              },
              {
                icon: <BarChart2 className="h-6 w-6 text-indigo-600" />,
                title: "Real-Time Performance Insights",
                description: "Get instant feedback on your answers, communication style, and confidence level."
              },
              {
                icon: <Target className="h-6 w-6 text-indigo-600" />,
                title: "Unlimited Practice Rounds",
                description: "Hone your skills with realistic scenarios tailored to your target industry and role."
              },
              {
                icon: <UserCheck className="h-6 w-6 text-indigo-600" />,
                title: "Smart Coaching & Recommendations",
                description: "Receive personalized tips and strategies to improve your interview performance."
              },
              {
                icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
                title: "Personalized Experience",
                description: "Custom-tailored questions and feedback based on your experience and target job role."
              },
              {
                icon: <Trophy className="h-6 w-6 text-indigo-600" />,
                title: "Track Your Progress",
                description: "Monitor your improvement over time with detailed performance analytics."
              }
            ].map((feature, index) => (
              <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="bg-indigo-50 p-2 rounded-lg w-fit mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-slate-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id = "how-it-works" className="w-full py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A simple three-step process to elevate your interview performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Create Your Interview",
                description: "Choose from a variety of tech job roles, or specific skills you want to practice."
              },
              {
                number: "02",
                title: "Practice with AI",
                description: "Engage in realistic interview scenarios with our advanced AI interviewer."
              },
              {
                number: "03",
                title: "Review & Improve",
                description: "Get detailed feedback and actionable insights to enhance your performance."
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-indigo-100 mb-2">{step.number}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="w-full py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their interview skills
            </p>
          </div>

          <Tabs defaultValue="tech" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="tech">Software Engineer</TabsTrigger>
              <TabsTrigger value="da">Data Analyst</TabsTrigger>
              <TabsTrigger value="qa">Quality Assurance</TabsTrigger>
            </TabsList>
            <TabsContent value="tech" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    quote: "After practicing with IntervAI for just two weeks, I felt so much more confident during my Google interview. I got the job!",
                    author: "Michael L.",
                    role: "Software Engineer"
                  },
                  {
                    quote: "The personalized feedback on my technical explanations helped me communicate complex concepts more clearly. Game changer!",
                    author: "Priya K.",
                    role: "Data Scientist"
                  }
                ].map((testimonial, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardContent className="pt-6">
                      <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-medium text-slate-900">{testimonial.author}</p>
                        <p className="text-slate-500 text-sm">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="da" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    quote: "Practicing SQL and case studies on IntervAI made me feel fully prepared for my data analyst interview at EY.",
                    author: "Neha M.",
                    role: "Data Analyst"
                  },
                  {
                    quote: "I struggled with interpreting dashboards and metrics, but the tailored mock sessions helped me nail my interview at Nielsen.",
                    author: "Carlos G.",
                    role: "Business Data Analyst"
                  }
                ].map((testimonial, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardContent className="pt-6">
                      <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-medium text-slate-900">{testimonial.author}</p>
                        <p className="text-slate-500 text-sm">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="qa" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    quote: "The bug-reporting scenario questions on IntervAI were spot-on. Helped me ace my QA round at Infosys.",
                    author: "Tanya S.",
                    role: "Quality Assurance Engineer"
                  },
                  {
                    quote: "I gained confidence in explaining test cases and automation workflows clearly. IntervAI made a big difference.",
                    author: "Mark J.",
                    role: "QA Automation Tester"
                  }
                ].map((testimonial, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardContent className="pt-6">
                      <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-medium text-slate-900">{testimonial.author}</p>
                        <p className="text-slate-500 text-sm">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-6 bg-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Transform Your Interview Skills?</h2>
          <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already boosted their interview confidence and success rate.
          </p>
          <Button
            onClick={handleButtonClick}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8"
          >
            {isSignedIn ? "Take an Interview" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-slate-600 mt-4">Absolutely Free</p>
        </div>
      </section>

      {/* Footer - in footer.tsx */}
    </div>
  );
};

export default HomePage;
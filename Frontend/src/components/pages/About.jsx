import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Target, Heart, Award,Star, Zap, Shield, Headphones } from 'lucide-react';

const About = () => {
    const stats = [
        { number: '50K+', label: 'Happy Customers', icon: Users },
        { number: '10K+', label: 'Products', icon: Star },
        { number: '99.9%', label: 'Uptime', icon: Zap },
        { number: '24/7', label: 'Support', icon: Headphones }
    ];

    const values = [
        {
            icon: Shield,
            title: 'Integrity',
            description: 'Conducting business with honesty and transparency in every interaction.'
        },
        {
            icon: Heart,
            title: 'Customer Focus',
            description: 'Placing our customers\' needs at the heart of every decision we make.'
        },
        {
            icon: Zap,
            title: 'Innovation',
            description: 'Continuously improving to meet evolving market demands and expectations.'
        },
        {
            icon: Target,
            title: 'Sustainability',
            description: 'Promoting environmentally responsible practices for a better future.'
        }
    ];

    const features = [
        'Extensive product catalog across multiple categories',
        'Secure and fast checkout process',
        '24/7 customer support to assist you anytime',
        'Regular discounts and exclusive offers for loyal customers'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section with Gradient Background */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                        <Award className="w-4 h-4 mr-2" />
                        Your Trusted Shopping Partner Since 2025
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                        About Novamart
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Revolutionizing online shopping with innovative technology, exceptional service, and sustainable practices
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Stats Section */}
                <section className="mb-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-1">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                                    <div className="text-gray-600 text-sm">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Story Section */}
                <section className="mb-20">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                                Our Story
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-700 text-lg leading-relaxed">
                            Founded in 2025, Novamart began with a bold vision to revolutionize the online shopping experience. What started as a passionate idea has grown into a thriving e-commerce platform that serves thousands of customers worldwide. We've built our reputation on connecting customers with quality products effortlessly, offering everything from cutting-edge electronics to the latest fashion trends, all while maintaining our unwavering commitment to customer satisfaction and continuous innovation.
                        </CardContent>
                    </Card>
                </section>

                {/* Mission Section */}
                <section className="mb-20">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl border-0 hover:shadow-2xl transition-all duration-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
                                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-4"></div>
                                Our Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-700 text-lg leading-relaxed">
                            At Novamart, we're on a mission to deliver exceptional value through a seamless, delightful shopping experience. We empower our customers by providing access to diverse, high-quality products at competitive prices, while maintaining the highest standards of service. Our commitment extends beyond commerce – we're dedicated to sustainability, integrating eco-friendly practices into every aspect of our operations to create a positive impact on our planet and communities.
                        </CardContent>
                    </Card>
                </section>

                {/* Values Section */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-gray-600 text-lg">The principles that guide everything we do</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => {
                            const IconComponent = value.icon;
                            return (
                                <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 group hover:-translate-y-2">
                                    <CardContent className="p-6 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* Team Section */}
                <section className="mb-20">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center">
                                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-4"></div>
                                Meet Our Team
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-700 text-lg leading-relaxed">
                            Behind Novamart's success is a diverse team of passionate professionals who bring our vision to life every day. From our tech innovators who ensure a flawless website experience to our dedicated customer service representatives who go above and beyond to help you, every team member plays a crucial role in making your shopping journey exceptional. We're united by our shared commitment to excellence and our passion for creating meaningful connections with our customers.
                        </CardContent>
                    </Card>
                </section>

                {/* Why Choose Us Section */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Novamart?</h2>
                        <p className="text-gray-600 text-lg">Experience the difference that sets us apart</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed">{feature}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
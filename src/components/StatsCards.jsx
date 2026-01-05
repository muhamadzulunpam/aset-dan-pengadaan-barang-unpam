// src/components/StatsCards.js
import React from 'react';
import { Users, DollarSign, TrendingUp, Eye, ArrowUp, ArrowDown } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald',
      description: 'From last month',
      gradient: 'from-emerald-500 to-cyan-500'
    },
    {
      title: 'Active Users',
      value: '12,402',
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      description: 'From last week',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '-2%',
      trend: 'down',
      icon: TrendingUp,
      color: 'rose',
      description: 'From last quarter',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      title: 'Page Views',
      value: '84,402',
      change: '+15%',
      trend: 'up',
      icon: Eye,
      color: 'violet',
      description: 'From yesterday',
      gradient: 'from-violet-500 to-purple-500'
    }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-emerald-600' : 'text-rose-600';
  };

  const getBgColor = (trend) => {
    return trend === 'up' ? 'bg-emerald-50' : 'bg-rose-50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover-lift group relative overflow-hidden"
        >
          {/* Background Gradient Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</p>
              
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getBgColor(stat.trend)} ${getTrendColor(stat.trend)}`}>
                {getTrendIcon(stat.trend)}
                <span className="ml-1">{stat.change}</span>
              </div>
              
              <p className="text-slate-500 text-xs mt-2">{stat.description}</p>
            </div>
            
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full bg-gradient-to-r ${stat.gradient} ${
                stat.trend === 'up' ? 'w-3/4' : 'w-1/2'
              }`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
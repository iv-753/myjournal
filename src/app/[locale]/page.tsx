'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, BarChart3, Calendar, Clock, Target, TrendingUp, Users } from 'lucide-react';
import UserNav from "../UserNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { t, Locale } from '@/lib/i18n';
import { use } from 'react';

interface LocalePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default function LocalePage({ params }: LocalePageProps) {
  const { locale } = use(params);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* 右上角用户信息/登录 */}
      <div className="absolute top-6 right-8 z-50 flex items-center space-x-4">
        <LanguageSwitcher currentLocale={locale} />
        <UserNav />
      </div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-full dark:bg-teal-900 dark:text-teal-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                {locale === 'en' ? 'Daily Growth Recording Tool' : '每日成长记录工具'}
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t('home.title', locale)}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.subtitle', locale)}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/${locale}/log`}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t('home.startLogging', locale)}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href={`/${locale}/history`}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  {t('home.viewHistory', locale)}
                </Link>
                <Link
                  href={`/${locale}/stats`}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-700 bg-teal-50 border-2 border-teal-200 rounded-lg hover:bg-teal-100 dark:text-teal-300 dark:bg-teal-900/20 dark:border-teal-700 dark:hover:bg-teal-900/30 transition-all duration-300"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {t('home.viewStats', locale)}
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  {locale === 'en' ? 'Free to Use' : '免费使用'}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  {locale === 'en' ? 'Data Security' : '数据安全'}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  {locale === 'en' ? 'Sync Anytime' : '随时同步'}
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2">
                    <Image
                      src="/placeholder.svg"
                      alt={locale === 'en' ? 'App Interface Screenshot' : '应用界面截图'}
                      width={600}
                      height={400}
                      className="rounded-lg"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.features.title', locale)}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('home.features.subtitle', locale)}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? 'Goal-Oriented' : '目标导向'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'en' 
                  ? 'Clearly record daily gains, challenges and solutions to help you better plan tomorrow and achieve continuous progress.'
                  : '清晰记录每日收获、挑战与解法，帮助你更好地规划明日计划，实现持续进步。'
                }
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? 'Data Insights' : '数据洞察'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'en'
                  ? 'Smart statistics on work time, consecutive check-in days and other key metrics to visualize your growth trajectory.'
                  : '智能统计工作时间、连续打卡天数等关键指标，让你直观看到自己的成长轨迹。'
                }
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? 'Time Management' : '时间管理'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'en'
                  ? 'Precisely record work time in hours and minutes to help you better manage time allocation.'
                  : '精确记录工作时间，支持小时和分钟单位，帮助你更好地管理时间分配。'
                }
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? 'History Review' : '历史回顾'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'en'
                  ? 'Complete preservation of all historical records with editing and deletion support to review past efforts and gains anytime.'
                  : '完整保存所有历史记录，支持编辑和删除，随时回顾过去的努力和收获。'
                }
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? 'Continuous Improvement' : '持续改进'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'en'
                  ? 'Automatic project history suggestions to avoid duplicate records and focus on real growth and progress.'
                  : '通过项目历史自动提示，避免重复记录，专注于真正的成长和进步。'
                }
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {locale === 'en' ? 'User Friendly' : '用户友好'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'en'
                  ? 'Clean and intuitive interface design with responsive layout and dark mode support for the best user experience.'
                  : '简洁直观的界面设计，响应式布局，支持深色模式，提供最佳的使用体验。'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {locale === 'en' ? 'Start Your Growth Journey' : '开始你的成长之旅'}
            </h2>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              {locale === 'en' 
                ? 'Start recording now and make every day\'s effort traceable'
                : '立即开始记录，让每一天的努力都有迹可循'
              }
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link
              href={`/${locale}/log`}
              className="inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-teal-600 bg-white rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {locale === 'en' ? 'Start Recording Now' : '立即开始记录'}
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
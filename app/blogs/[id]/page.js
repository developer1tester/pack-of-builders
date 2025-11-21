import { createClient } from "../../../lib/supabase/server";
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function SingleBlogPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: blog, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !blog) {
    notFound();
  }

  return (
    
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href="/blogs">
            <button className="flex items-center text-gray-600 hover:text-orange-600 transition-colors font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blogs
            </button>
          </Link>

          {/* Blog Header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {blog.image_url && (
              <div className="h-96 bg-gradient-to-br from-gray-100 to-orange-50 overflow-hidden">
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8 lg:p-12">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  blog.published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {blog.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {blog.updated_at && blog.updated_at !== blog.created_at && (
                  <span className="text-sm text-gray-500">
                    Updated: {new Date(blog.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-orange-500 pl-6 py-2">
                  {blog.excerpt}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-gray-100 to-orange-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Info */}
              {blog.author && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {blog.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{blog.author}</p>
                      <p className="text-sm text-gray-500">Author</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}

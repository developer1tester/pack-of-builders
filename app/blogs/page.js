import { createPublicClient } from "../../lib/supabase/server";
import { cacheTag, cacheLife } from 'next/cache';
import Link from 'next/link';
import { Suspense } from 'react';

async function getRecentArticles() {
  "use cache"
  // This cache can be revalidated by webhook or server action
  // when you call revalidateTag("blog_posts")
  cacheTag("blog_posts");
  // This cache will revalidate after an hour even if no explicit
  // revalidate instruction was received
  cacheLife('hours');

  const supabase = createPublicClient();

  // Fetch blogs from the database
  const { data: blogs, error } = await supabase
    .from('blog_posts')
    .select('*');

  return { blogs, error };
}
async function BlogsList() {
  const { blogs, error } = await getRecentArticles();

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading blogs: {error.message}
        </div>
      )}

      {blogs && blogs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
          <p className="text-gray-500">Check back soon for new blog posts</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs && blogs.map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.id}`}>
            <div className="group bg-white rounded-xl border border-gray-200 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-orange-100">
              {blog.image_url && (
                <div className="h-48 bg-gradient-to-br from-gray-100 to-orange-50 overflow-hidden">
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    blog.published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                {blog.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {blog.excerpt}
                  </p>
                )}
                <div className="flex items-center text-orange-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  Read more
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function BlogsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent mb-2">
              Blogs
            </h1>
            <p className="text-gray-600">Explore our latest blog posts</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="text-center py-16 text-gray-500">
            Loading blogs...
          </div>
        }>
          <BlogsList />
        </Suspense>
      </div>
    </main>
  );
}

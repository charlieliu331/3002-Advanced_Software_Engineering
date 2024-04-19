import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="text-center h-16 sm:h-20 w-full sm:pt-2 pt-4 border-t mt-5 flex sm:flex-row flex-col justify-between items-center px-3 space-y-3 sm:mb-0 mb-3">
      <div>
        Powered by{' '}
        <a
          href="https://openai.com/research/whisper"
          target="_blank"
          rel="noreferrer"
          className="font-bold hover:underline transition underline-offset-2"
        >
          Whisper{' '}
        </a>
        and{' '}
        <a
          href="https://openai.com/research/gpt-4"
          target="_blank"
          rel="noreferrer"
          className="font-bold hover:underline transition underline-offset-2"
        >
          GPT-4
        </a>
      </div>
      <div className="flex space-x-4 pb-4 sm:pb-0">
        <Link
          href="https://www.linkedin.com/in/nathanaxel/"
          className="group"
          aria-label="Your Company on LinkedIn"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </Link>
      </div>
    </footer>
  );
}

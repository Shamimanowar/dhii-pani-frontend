import Image from "next/image";
import Link from "next/link";
import '../css/app-page.css';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f7fafc] to-[#e3e9f7] p-0">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white/80 rounded-2xl shadow-xl overflow-hidden mt-16 mb-8">
        {/* Left Side: About & Articles */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#345995] mb-4">
              Department of Environment (DoE), Bangladesh
            </h1>
            <p className="text-lg text-[#222] mb-6 leading-relaxed">
              The Department of Environment (DoE) of Bangladesh plays a pivotal
              role in ensuring sustainable industrial growth and environmental
              protection.{" "}
              <b>Effluent Treatment Plant (ETP)</b> management is crucial for
              industries, especially in the textile sector, to minimize water
              pollution and comply with national and international standards.
              Proper ETP operation not only safeguards our rivers and communities
              but also enhances the global competitiveness of Bangladesh's
              textile industry.
            </p>
            <p className="text-base text-[#345995] font-semibold mb-2">
              Why ETP Management Matters:
            </p>
            <ul className="list-disc list-inside text-base text-[#444] mb-6 pl-2">
              <li>Protects water bodies and public health</li>
              <li>Ensures compliance with DoE regulations</li>
              <li>Supports sustainable industrial development</li>
              <li>Improves international market access for textiles</li>
            </ul>
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#345995] mb-2">
              Useful Articles & Resources
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://doe.gov.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#345995] hover:underline font-medium"
                >
                  Department of Environment, Bangladesh
                </a>
              </li>
              <li>
                <a
                  href="https://kingsleygroup.co/blogs/sustainable-solutions-how-etp-plants-are-revolutionizing-the-textile-industry-in-bangladesh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#345995] hover:underline font-medium"
                >
                  Best Practices in ETP Management for Textile Industries
                </a>
              </li>
              <li>
                <a
                  href="https://www.unescap.org/sites/default/files/State%20of%20Water%20Pollution%20from%20Industrial%20Effluents%20in%20BD.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#345995] hover:underline font-medium"
                >
                  Industrial Effluent and Water Pollution in Bangladesh
                </a>
              </li>
              <li>
                <a
                  href="https://www.unido.org/sites/default/files/files/2022-07/TEXTILE_FACTSHEET.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#345995] hover:underline font-medium"
                >
                  UNIDO: Bangladesh Textile Industry Steps Towards Sustainability
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* Right Side: Login CTA */}
        <div className="flex flex-col items-center justify-center flex-1 bg-gradient-to-tl from-[#345995]/10 to-[#6DECB9]/10 p-8 md:p-12">
          <Image
            src="/dhi_logo.jpg"
            alt="ETP Monitoring Portal Logo"
            width={120}
            height={120}
            className="mb-6 rounded-full shadow-lg object-cover border-4 border-[#e3e9f7] bg-[#e3e9f7] dhi-logo-bg"
            priority
          />
          <h2 className="text-2xl font-bold text-[#345995] mb-4 text-center">
            ETP Monitoring Portal
          </h2>
          <p className="text-base text-[#444] mb-8 text-center max-w-xs">
            Log in to access real-time ETP data, dashboards, and compliance tools
            for your industry.
          </p>
          <Link href="/login" passHref>
            <button type="button" className="inline-block bg-[#345995] hover:bg-[#23376b] text-white font-semibold text-lg px-8 py-3 rounded-xl shadow-lg transition-colors duration-200">
              Login to Portal
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

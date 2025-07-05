"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import "../../css/app-page.css";

export default function Home() {
  useEffect(() => {
    // Developer Console Signature
    console.clear();
    console.log('%c🚀 DHII Pani Environmental Monitoring System', 'color: #4CAF50; font-size: 20px; font-weight: bold; background: #E8F5E8; padding: 10px; border-radius: 5px;');
    console.log('%c💻 Developed by: Shamim Anowar', 'color: #2196F3; font-size: 16px; font-weight: bold;');
    console.log('%c📧 Email: shamim.hire@gmail.com', 'color: #FF9800; font-size: 14px; font-weight: bold;');
    console.log('%c📱 Phone: +880 1612 879888', 'color: #9C27B0; font-size: 14px; font-weight: bold;');
    console.log('%c🌐 Portfolio: https://shm-port.netlify.app/', 'color: #607D8B; font-size: 14px; font-weight: bold;');
    console.log('%c💼 LinkedIn: https://www.linkedin.com/in/shamimanowar/', 'color: #0077B5; font-size: 14px; font-weight: bold;');
    console.log('%c🐙 GitHub: https://github.com/Shamimanowar', 'color: #333; font-size: 14px; font-weight: bold;');
    console.log('%c🏆 Specialized in: IoT Solutions, Environmental Tech, Full-Stack Development', 'color: #795548; font-size: 12px;');
    console.log('%c📅 Project Year: 2024-2025', 'color: #E91E63; font-size: 12px;');
    console.log('%c💡 Type "developer.verify()" for detailed verification', 'color: #00BCD4; font-size: 14px; font-style: italic;');

    // Global Developer Object
    window.developer = {
      name: "Shamim Anowar",
      email: "shamim.hire@gmail.com", 
      phone: "+880 1612 879888",
      portfolio: "https://shm-port.netlify.app/",
      linkedin: "https://www.linkedin.com/in/shamimanowar/",
      github: "https://github.com/Shamimanowar",
      project: "DHII Pani - Environmental Monitoring System",
      client: "Department of Environment (DoE), Bangladesh",
      year: "2024-2025",
      expertise: [
        "IoT Solutions", 
        "Environmental Technology", 
        "Full-Stack Development",
        "Software Engineering",
        "DevOps",
        "AWS Cloud Services, Azure, DigitalOcean",
        "AI/ML Solutions", 
        "Database Design", 
        "API Development",
        "React/Next.js",
        "PostgreSQL",
        "MQTT/TCP Protocols"
      ],
      technologies: [
        "Next.js 15", 
        "React 19", 
        "PostgreSQL", 
        "Node.js", 
        "IoT Sensors",
        "MQTT Protocol",
        "Recharts",
        "HTML2Canvas",
        "jsPDF"
      ],
      verify: function() {
        console.clear();
        console.log('%c✅ DEVELOPER VERIFICATION SUCCESSFUL', 'color: #FFFFFF; font-size: 20px; font-weight: bold; background: #4CAF50; padding: 15px; border-radius: 10px;');
        console.log('%c', 'font-size: 10px;');
        console.log('%c👨‍💻 DEVELOPER INFORMATION', 'color: #2196F3; font-size: 18px; font-weight: bold; text-decoration: underline;');
        console.log('%c📝 Name: ' + this.name, 'color: #333; font-size: 16px; font-weight: bold;');
        console.log('%c📧 Email: ' + this.email, 'color: #FF9800; font-size: 16px; font-weight: bold;');
        console.log('%c📱 Phone: ' + this.phone, 'color: #9C27B0; font-size: 16px; font-weight: bold;');
        console.log('%c🌐 Portfolio: ' + this.portfolio, 'color: #607D8B; font-size: 16px; font-weight: bold;');
        console.log('%c💼 LinkedIn: ' + this.linkedin, 'color: #0077B5; font-size: 16px; font-weight: bold;');
        console.log('%c🐙 GitHub: ' + this.github, 'color: #333; font-size: 16px; font-weight: bold;');
        console.log('%c', 'font-size: 10px;');
        console.log('%c🏗️ PROJECT DETAILS', 'color: #795548; font-size: 18px; font-weight: bold; text-decoration: underline;');
        console.log('%c🎯 Project: ' + this.project, 'color: #333; font-size: 16px; font-weight: bold;');
        console.log('%c🏢 Client: ' + this.client, 'color: #4CAF50; font-size: 16px; font-weight: bold;');
        console.log('%c📅 Year: ' + this.year, 'color: #E91E63; font-size: 16px; font-weight: bold;');
        console.log('%c', 'font-size: 10px;');
        console.log('%c🚀 EXPERTISE', 'color: #00BCD4; font-size: 18px; font-weight: bold; text-decoration: underline;');
        this.expertise.forEach(skill => {
          console.log('%c✓ ' + skill, 'color: #4CAF50; font-size: 14px;');
        });
        console.log('%c', 'font-size: 10px;');
        console.log('%c🛠️ TECHNOLOGIES USED', 'color: #FF5722; font-size: 18px; font-weight: bold; text-decoration: underline;');
        this.technologies.forEach(tech => {
          console.log('%c⚡ ' + tech, 'color: #2196F3; font-size: 14px;');
        });
        console.log('%c', 'font-size: 10px;');
        console.log('%c🎉 Want to hire me for your next project?', 'color: #FFFFFF; font-size: 16px; font-weight: bold; background: #FF9800; padding: 10px; border-radius: 5px;');
        console.log('%c📧 Contact: shamim.hire@gmail.com | 📱 +880 1612 879888', 'color: #333; font-size: 14px; font-weight: bold;');
        console.log('%c💼 LinkedIn: https://www.linkedin.com/in/shamimanowar/ | 🐙 GitHub: https://github.com/Shamimanowar', 'color: #333; font-size: 14px; font-weight: bold;');
        
        return {
          message: "✅ Developer verification completed!",
          developer: this.name,
          contact: this.email,
          phone: this.phone,
          portfolio: this.portfolio,
          linkedin: this.linkedin,
          github: this.github
        };
      },
      contact: function() {
        window.open('mailto:' + this.email + '?subject=Project Inquiry - DHII Pani System&body=Hello Shamim,%0D%0A%0D%0AI saw your work on the DHII Pani Environmental Monitoring System and would like to discuss a project.%0D%0A%0D%0ABest regards,');
      },
      portfolio: function() {
        window.open(this.portfolio, '_blank');
      },
      linkedin: function() {
        window.open(this.linkedin, '_blank');
      },
      github: function() {
        window.open(this.github, '_blank');
      }
    };

    // Additional global aliases
    window.shamim = window.developer;
    window.dev = window.developer;
    
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f7fafc] to-[#e3e9f7] p-0"
      onDoubleClick={(e) => {
        if (e.ctrlKey && e.shiftKey) {
          alert(
            "🚀 DHII Pani System\n💻 Developed by: Shamim Anowar\n📧 shamim.hire@gmail.com\n📱 +880 1612 879888\n🌐 Portfolio: https://shm-port.netlify.app/\n💼 LinkedIn: https://www.linkedin.com/in/shamimanowar/\n🐙 GitHub: https://github.com/Shamimanowar\n\n✨ Secret Easter Egg Activated!\n\n💡 Open Console (F12) and type 'developer.verify()' for full verification!"
          );
        }
      }}
      data-developer="Shamim Anowar"
      data-developer-email="shamim.hire@gmail.com" 
      data-developer-phone="+880 1612 879888"
      data-developer-portfolio="https://shm-port.netlify.app/"
      data-developer-linkedin="https://www.linkedin.com/in/shamimanowar/"
      data-developer-github="https://github.com/Shamimanowar"
      data-project="DHII Pani Environmental Monitoring System"
      data-client="Department of Environment Bangladesh"
      data-year="2024-2025"
      data-easter-egg="Ctrl+Shift+DoubleClick for developer info"
    >
      {/* Hidden developer signature for HTML inspection */}
      <div style={{ display: 'none' }} id="developer-signature">
        Developed by Shamim Anowar | shamim.hire@gmail.com | +880 1612 879888 | Portfolio: https://shm-port.netlify.app/ | LinkedIn: https://www.linkedin.com/in/shamimanowar/ | GitHub: https://github.com/Shamimanowar | Project: DHII Pani Environmental Monitoring System
      </div>
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
              but also enhances the global competitiveness of Bangladesh&apos;s
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

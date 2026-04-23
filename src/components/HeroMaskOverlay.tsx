export default function HeroMaskOverlay() {
  return (
    <div 
      className="absolute bottom-0 left-1/2 pointer-events-none"
      style={{
        width: "250vw", // Massive scaling
        minWidth: "1500px",
        // We push it down significantly so only the top bar of the logo shows at the bottom
        transform: "translateX(-50%) translateY(45%)",
        zIndex: 20, // Sit above the hero image gradients, below the social icons
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 3405.65 2807.65" 
        className="w-full h-auto drop-shadow-2xl"
      >
        <path 
          fill="#040506" 
          d="M2935.73,558.88l-231.73,246.26c-100.86,107.19-157.02,248.82-157.02,396.01v397.42c0,95.65-27.79,189.28-79.99,269.46l-217.09,333.45c-62.33,95.74-168.84,153.5-283.08,153.5h-285.12c336.43-104.7,580.68-418.52,580.68-789.4,0-55.43-5.46-109.6-15.88-161.97l83.78,141.07c18.83,31.73,67.49,18.36,67.49-18.52v-837.92c0-44.91-36.42-81.3-81.32-81.3h-841.2c-36.93,0-50.25,48.75-18.43,67.53l133.73,78.95c-50.13-9.52-101.89-14.49-154.79-14.49-456.53,0-826.61,370.1-826.61,826.64,0,293.14,152.58,550.64,382.69,697.41-266.2-126.7-466.69-374.25-522.47-679.51-110.45-604.17,350.59-1130.54,934.6-1130.54h1485.98c55.08,0,83.53,65.82,45.77,105.94Z"
        />
      </svg>
    </div>
  );
}

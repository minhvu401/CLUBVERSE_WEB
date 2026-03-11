export type BannerItem = {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
};

export async function getBanners(): Promise<BannerItem[]> {
  // giả lập delay API
  await new Promise((r) => setTimeout(r, 300));

  return [
    {
      _id: "banner-1",
      title: "🔥 TUẦN LỄ CLB SINH VIÊN",
      description: "Hơn 20 câu lạc bộ – Workshop – Quà tặng",
      image:
        "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
      link: "/events",
    },
    {
      _id: "banner-2",
      title: "🎤 TALKSHOW KỸ NĂNG MỀM",
      description: "Diễn giả doanh nghiệp – Chứng nhận tham gia",
      image:
        "https://images.unsplash.com/photo-1503428593586-e225b39bddfe",
      link: "/events",
    },
    {
      _id: "banner-3",
      title: "🎓 TUYỂN THÀNH VIÊN CLB",
      description: "Mở rộng mạng lưới – Phát triển bản thân",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
      link: "/clubs",
    },
  ];
}

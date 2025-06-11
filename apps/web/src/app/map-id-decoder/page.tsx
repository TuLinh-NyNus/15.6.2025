import MapIDDecoderComponent from "@/components/MapIDDecoder";

export const metadata = {
  title: 'MapID Decoder',
  description: 'Giải mã các mã MapID',
};

export default function MapIDDecoderPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">MapID Decoder</h1>
      <p className="text-center mb-8 text-gray-600">
        Công cụ giúp giải mã các MapID từ file Map ID.tex và hiển thị thông tin chi tiết
      </p>
      
      <MapIDDecoderComponent />
    </div>
  );
} 
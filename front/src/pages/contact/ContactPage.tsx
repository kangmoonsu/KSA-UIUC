import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { Paperclip, X } from "lucide-react";
import { sendContact } from "@/lib/api/contact";

export default function ContactPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [email, setEmail] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("제목을 입력해주세요.");
            return;
        }
        if (!validateEmail(email)) {
            toast.error("올바른 이메일 주소를 입력해주세요.");
            return;
        }
        if (!content.trim() || content === "<p><br></p>") {
            toast.error("내용을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            await sendContact({ title, email, content, file });
            toast.success("문의사항이 성공적으로 전송되었습니다.");
            navigate("/");
        } catch (error) {
            console.error("Contact submission error:", error);
            toast.error("문의사항 전송 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto py-20 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-navy mb-4">Contact Us</h1>
                <p className="text-muted-foreground">관리자에게 궁금한 점이나 건의사항을 보내주세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        placeholder="문의 제목을 입력해주세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">답변 받을 이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">문의 내용</Label>
                    <div className="min-h-[300px] border rounded-md overflow-hidden">
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="문의 내용을 상세히 적어주세요."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>파일 첨부 (선택)</Label>
                    {!file ? (
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 border-gray-200 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">파일을 클릭하거나 드래그하여 업로드하세요</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-xl">
                            <div className="flex items-center gap-3">
                                <Paperclip className="h-5 w-5 text-navy" />
                                <span className="text-sm font-medium">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={removeFile}
                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-navy hover:bg-navy/90 text-white font-semibold py-6 rounded-xl transition-all"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "전송 중..." : "문의하기 전송"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

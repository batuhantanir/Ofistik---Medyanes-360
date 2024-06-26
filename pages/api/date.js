// POST isteği ile gönderilen veri JSON formatında olmalıdır ve aşağıdaki alanları içermelidir:
// {
//   "confirm": boolean,          // Onaylanmış mı?
//   "date_of_birth": string,      // Doğum tarihi
//   "delete": boolean,            // Silindi mi?
//   "duration": number,           // Süre
//   "service": string,            // Hizmet
//   "notes": string,              // Notlar
//   "language": string,           // Dil
//   "kim_icin": string,           // Kendin veya Başkası
//   "gender": string?,            // Cinsiyet (isteğe bağlı)
//   "firstName": string?,         // İsim (isteğe bağlı)
//   "lastName": string?           // Soyisim (isteğe bağlı)
// }

import prisma from '@/lib/prisma';

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const allDates = await prisma.date.findMany();
            res.json(allDates);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve dates' });
        }
    } else if (req.method === 'POST') {
        console.log(req.body)
        try {
            const createdDate = await prisma.date.create({
                data: req.body,
            });

            res.status(201).json(createdDate);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Date creation failed' });
        }
    } else if (req.method === 'PUT') {
        const { id, data } = req.body;
        try {
            const updatedDate = await prisma.date.update({
                where: {
                    id: id,
                },
                data: data,
            });
            const response_data = await prisma.date.findMany({})
            res.json(response_data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Date update failed' });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await prisma.date.delete({
                where: {
                    id: id,
                },
            });
            res.json({ message: 'Date deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Date deletion failed' });
        }
    } else {
        res.status(405).json({ statusCode: 405, message: 'Method Not Allowed' });
    }
}

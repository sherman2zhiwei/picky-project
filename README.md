## Setup/Installation
### Running dev locally
1. Install dependencies
```bash
npm install
```

2. Set up Prisma :
```bash
npx prisma generate
npx prisma db push
```

3. Start dev server : 
```bash
npm run dev
```

OR 

### Running Docker container
1. Build and start the Docker container using :
```bash
docker-compose up
```

After either one of the steps above, the application should now be running at http://localhost:3000



## Architectural Decisions
### Storing Images
Generally, storing large blobs in databases is not a good idea as it can degrade database performance. Common practice would probably be to store it in a cloud storage service like Amazon S3, but for the sake of simplicity and to keep the scope narrow I decided to store these images in the server's local filesystem and serve it like a static file. Every image would have a compressed and original version, with the compressed being stored in ```/public/uploads/compressed``` and the originals being stored in ```public/uploads/original```. 

### ORM
Since Prism is a popular ORM for Next.js, decided to just go with it instead of using raw SQL queries directly to SQLite. Just an additional layer of security and to simplify things.

### Schema in Database
The Image model/table corresponds to images, and every row has metadata about the original and compressed image, including path to the images, size of the images, file type, filename and created/updated timestamps. Nothing fancy, just puts the information about the original and compressed image in one place

### Image Service
Since handling images generally involve a few shared functions like storing the image, compressing the image and storing metadata, thought it would make sense to abstract this one to a service that could be re-used.

### User Interface
Kept things simple and had 2 components in the homepage : one for the image upload and one for the image gallery. Whenever a new image is uploaded to the server, the image gallery will be reloaded. An image preview is also available before the user decides to upload to server. In the gallery below the image upload component, user can view each image as a card with some metadata, and click on the individual images to open up a modal and view the compressed vs original image.

### File Organization
Using pretty standard Next.js file system conventions, storing APIs in ```/pages/api```, frontend components in `/components` and any libraries under `/lib`

## Instructions to Run and Test
After running ```npm run dev```, visit `http://localhost:3000/` to open the image uploader. There, you can pick a file by clicking on the file picker, preview the file, and upload it. After uploading it, you can view the pictures you uploaded in the gallery below. 

## Assumptions/Limitations
1. No file size limit is implemented right now, so might lead to memory issues if large images are uploaded.
2. File permissions are also needed to setup certain directories, hence it is assumed the app has the relevant access.
3. The compressed image is always in the JPEG format with 70% compression. Might be better if it was more flexible (perhaps letting the user choose the output format/compression level)
4. SQLite was used for simplicity, but might not suit production-level traffic and requirements. 
5. No authentication to limit who can see which images.
6. Error handling is pretty basic, might not cover all cases.
7. No DB migrations were created for the sake of simplicity, but definitely needed for a production environment.

## How AI was used
I started by basically explaining the overall output of the project, as well as some design decisions that I wanted the AI to take into account. The chat log I used was : 

> Can you build a Next.js backend that accepts an image upload, calls another endpoint to compress the image, store the original image and compressed image and store related metadata in an SQLite database using an ORM?

Modifications were then made to make sure both the compression API and the image upload API were using the ImageService. Frontend was also generated from the prompt.
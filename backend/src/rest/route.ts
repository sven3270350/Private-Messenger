import express, { Router } from 'express'
import { getPayload, verifyPayload } from './controller/auth'
import { createUser, deleteUser, getUser, updateUser, searchUsers, checkUserName, checkWallet } from './controller/user'
import { createOne2OneChat, getChatRoom } from './controller/chat'
import { newMessage, getMessages } from './controller/message'
import { createUserName, deleteUserName, getUserNames, updateUserName, purchaseUserName } from './controller/userName'
import { createContact, getContacts, deleteContact, updateContact } from './controller/contact'
import { uploadFile } from './controller/upload'
import multer from "multer";

const router: Router = express.Router()
const upload = multer({ dest: 'uploads/' });

router.route('/auth/payload').post(getPayload)
router.route('/auth/login').post(verifyPayload)
router.route('/auth/check-username').get(checkUserName)
router.route('/auth/w-login').get(checkWallet)
router.route('/auth/user').post(createUser)
router.route('/user/:id').delete(deleteUser)
router.route('/user/:id').put(updateUser)
router.route('/user/:id').get(getUser)
router.route('/chat').post(createOne2OneChat)
router.route('/search-user').get(searchUsers)
router.route('/chat/:targetAddress').get(getChatRoom)
router.route('/message').post(newMessage)
router.route('/message/:chatId').get(getMessages)
router.route('/username').post(createUserName)
router.route('/username').get(getUserNames)
router.route('/username/:id').delete(deleteUserName)
router.route('/username/:id').put(updateUserName)
router.route('/username/purchase/:id').put(purchaseUserName)
router.route('/contact').post(createContact)
router.route('/contact').get(getContacts)
router.route('/contact/:id').delete(deleteContact)
router.route('/contact/:id').put(updateContact)
router.route("/upload").post(upload.single('file'), uploadFile);

export default router

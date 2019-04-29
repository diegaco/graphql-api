import { Product } from './product.model'
import { User, roles } from '../user/user.model'
import { AuthenticationError } from 'apollo-server'
import mongoose from 'mongoose'

const productsTypeMatcher = {
  GAMING_PC: 'GamingPc',
  BIKE: 'Bike',
  DRONE: 'Drone'
}

/** product */
const product = (_, args, ctx) => {
  if (ctx.user) {
    return Product.findById(args.id)
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

const newProduct = (_, args, ctx) => {
  if (ctx.user && ctx.user.role === roles.admin) {
    // use this fake ID for createdBy for now until we talk auth
    // const createdBy = mongoose.Types.ObjectId()
    return Product.create({ ...args.input, createdBy: ctx.user._id })
  } else {
    throw new AuthenticationError()
  }
}

const products = (_, args, ctx) => {
  if (ctx.user) {
    return Product.find({})
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

const updateProduct = (_, args, ctx) => {
  const update = args.input

  if (ctx.user && ctx.user.role === roles.admin) {
    return Product.findByIdAndUpdate(args.id, update, { new: true })
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

const removeProduct = (_, args, ctx) => {
  if (ctx.user && ctx.user.role === roles.admin) {
    return Product.findByIdAndRemove(args.id)
      .lean()
      .exec()
  } else {
    throw new AuthenticationError()
  }
}

export default {
  Query: {
    products,
    product
  },
  Mutation: {
    newProduct,
    updateProduct,
    removeProduct
  },
  Product: {
    __resolveType(product) {
      return productsTypeMatcher[product.type]
    },
    createdBy(product) {
      return User.findById(product.createdBy)
        .lean()
        .exec()
    }
  }
}

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Relationships
  has_many :submissions, dependent: :destroy
  has_many :communities

  # Validations
  validates_uniqueness_of :username
  validates_presence_of :username
end

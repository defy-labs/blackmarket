import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import environment from '../../environment'
import useSigner from '../../hooks/useSigner'

function updateUserCurrentDefy(account: string) {
  const url = `${environment.DEFY_API_BASE_URL}/Operatives/defyBalance`

  return axios.get<{ amount: number; username: string }>(url, {
    params: {
      connectedAddress: account,
    },
  })
}

async function withdrawTokens(
  account: string,
  message: string,
  signedMessageHash: string,
) {
  const url = `${environment.DEFY_API_BASE_URL}/TokenBridge/withdrawTokens`
  return await axios.post(url, {
    WalletAddress: account,
    Message: message,
    Signature: signedMessageHash,
  })
}

type FormData = {
  transferAmount: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

const WithdrawModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('components')
  const signer = useSigner()

  // current account address
  const { account } = useWeb3React()

  const [currentDefyBalance, setCurrentDefyBalance] = useState(0)
  const [currentUsername, setCurrentUsername] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [withdrawTransferDisabled, setWithdrawTransferDisabled] =
    useState(false)
  const [withdrawnState, setWithdrawnState] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')

  const {
    register,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      transferAmount: 1,
    },
  })

  watch('transferAmount')
  const transferAmount = getValues('transferAmount')

  const withdrawToChain = handleSubmit(async (formData) => {
    if (account && formData.transferAmount > 0) {
      // Operative to sign message
      const message = `DEFY Withdrawal Request\nWallet Address: ${account}\nTokens: ${formData.transferAmount}`

      try {
        setIsTransferring(true)

        const signedMessageHash = await signer?.signMessage(message)
        const tx = await withdrawTokens(
          account,
          message,
          signedMessageHash || '',
        )
        setTransactionHash(tx.data.txnHash)
        setIsTransferring(false)
        setWithdrawnState(true)
      } catch (error) {
        setIsTransferring(false)
        console.log('[error processing withdrawal]', error)
      }
    }
  })

  const handleOnClickMax = async () => {
    setValue('transferAmount', currentDefyBalance || 0)
  }

  const handleOnClickWithdraw = async () => {
    if (transferAmount > 0) {
      await withdrawToChain()
    }
  }

  useEffect(() => {
    setWithdrawTransferDisabled(!!errors.transferAmount)
  }, [errors.transferAmount])

  useEffect(() => {
    if (account) {
      updateUserCurrentDefy(account)
        .then((result) => {
          setCurrentDefyBalance(result.data.amount)
          setCurrentUsername(result.data.username)
        })
        .catch((error) => {
          console.log(error)
          setCurrentDefyBalance(0)
          setCurrentUsername('')
        })
    }
  }, [account])

  // Run after txn to confirm with user completed txn
  useEffect(() => {
    if (account) {
      // update currentDefyBalance
      updateUserCurrentDefy(account)
        .then((result) => {
          setCurrentDefyBalance(result.data.amount)
          setCurrentUsername(result.data.username)
        })
        .catch((error) => {
          console.log(error)
          setCurrentDefyBalance(0)
          setCurrentUsername('')
        })
    }
  }, [transactionHash, account])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          <Heading as="h3" variant="heading1" color="brand.black">
            {t('withdraw.title')}
          </Heading>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          {account ? (
            <>
              <FormControl mb={10} isInvalid={!!errors.transferAmount}>
                <FormLabel>
                  <Text fontWeight="bold">
                    {t('withdraw.from')}
                    <Text as="span" fontWeight="normal">
                      &nbsp;
                      {`@${currentUsername}`}
                    </Text>
                  </Text>
                </FormLabel>

                <NumberInput
                  id="transferValue"
                  min={1}
                  max={100000}
                  step={10}
                  clampValueOnBlur={false}
                  w="full"
                  onChange={(value) =>
                    setValue('transferAmount', parseFloat(value))
                  }
                >
                  <InputLeftElement ml={2}>
                    <Box position="relative" width="32px" height="32px">
                      <Image
                        src="/DEFY-Token.png"
                        alt="DEFY Token"
                        layout="fill"
                        objectFit="cover"
                      />
                    </Box>
                  </InputLeftElement>

                  <NumberInputField
                    pl={14}
                    {...register('transferAmount', {
                      min: {
                        value: 1,
                        message: t('withdraw.transferInvalidMessage'),
                      },
                      max: {
                        value: currentDefyBalance,
                        message: t('withdraw.transferInvalidExceeded'),
                      },
                    })}
                  />

                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      variant="outline"
                      onClick={handleOnClickMax}
                    >
                      Max
                    </Button>
                  </InputRightElement>
                </NumberInput>

                <FormHelperText fontSize={16}>
                  {t('withdraw.balance')}: {currentDefyBalance.toString()}
                </FormHelperText>

                {!!errors.transferAmount && (
                  <FormErrorMessage>
                    {errors.transferAmount.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.transferAmount}>
                <FormLabel>
                  <Text fontWeight="bold">
                    {t('withdraw.to')}{' '}
                    <Text as="span" fontWeight="normal">
                      {account.slice(0, 7)}...{account.slice(-7)}
                    </Text>
                  </Text>
                </FormLabel>

                <NumberInput
                  isDisabled
                  value={transferAmount > 0 ? transferAmount : 0}
                  w="full"
                >
                  <InputLeftElement ml={2}>
                    <Box position="relative" width="32px" height="32px">
                      <Image
                        src="/DEFY-Token.png"
                        alt="DEFY Token"
                        layout="fill"
                        objectFit="cover"
                      />
                    </Box>
                  </InputLeftElement>

                  <NumberInputField pl={14} />
                </NumberInput>
              </FormControl>
            </>
          ) : (
            <Stack align="flex-start" spacing={12} flex="1 1 0%">
              <Text>Loading...</Text>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            isLoading={isTransferring}
            loadingText={t('withdraw.transferring')}
            disabled={withdrawTransferDisabled}
            variant="solid"
            size="lg"
            width="100%"
            onClick={handleOnClickWithdraw}
          >
            {t('withdraw.transfer')}
          </Button>
          {
            // todo: formatting
            withdrawnState && (
              <>
                <Text as="div">{t('withdraw.withdrawnSuccessfully')}</Text>
                <Button
                  size="lg"
                  width="100%"
                  onClick={(e) =>
                    window.open(
                      `https://polygonscan.com/tx/${transactionHash}`,
                      '_blank',
                    )
                  }
                >
                  {'Polygonscan'}
                </Button>
              </>
            )
          }
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default WithdrawModal
